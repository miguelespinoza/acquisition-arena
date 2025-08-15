class ElevenLabsAgentService
  include HTTParty
  
  base_uri 'https://api.elevenlabs.io/v1'
  
  def initialize
    @api_key = Rails.application.credentials.elevenlabs_api_key || ENV['ELEVENLABS_API_KEY']
    raise "ElevenLabs API key not found" unless @api_key
  end
  
  def create_agent_for_persona(persona)
    begin
      # Generate persona-specific configuration
      agent_config = build_agent_configuration(persona)
      
      # Create agent via ElevenLabs API
      response = self.class.post(
        '/convai/agents/create',
        headers: headers,
        body: agent_config.to_json
      )
      
      if response.success?
        agent_data = response.parsed_response
        
        {
          success: true,
          agent_id: agent_data['agent_id'],
          prompt: agent_config[:conversation_config][:agent][:prompt][:prompt],
          voice_settings: agent_config[:conversation_config][:tts][:voice_settings]
        }
      else
        Rails.logger.error('elevenlabs_agent_creation_failed',
          status_code: response.code,
          response_body: response.body,
          request_url: "#{self.class.base_uri}/convai/agents/create",
          persona_name: agent_config[:name]
        )
        {
          success: false,
          error: "API request failed: #{response.code} - #{response.message}"
        }
      end
      
    rescue StandardError => e
      Rails.logger.error('elevenlabs_agent_creation_error',
        error: e.message,
        backtrace: e.backtrace&.first(3)
      )
      {
        success: false,
        error: e.message
      }
    end
  end

  def delete_agent(agent_id)
    begin
      # Delete agent via ElevenLabs API
      response = self.class.delete(
        "/convai/agents/#{agent_id}",
        headers: headers
      )
      
      if response.success? || response.code == 404
        # Consider both success and 404 (already deleted) as successful
        {
          success: true,
          message: response.code == 404 ? "Agent already deleted" : "Agent deleted successfully"
        }
      else
        Rails.logger.error('elevenlabs_agent_deletion_failed',
          status_code: response.code,
          response_body: response.body,
          agent_id: agent_id
        )
        {
          success: false,
          error: "Failed to delete agent: #{response.code} - #{response.message}"
        }
      end
      
    rescue StandardError => e
      Rails.logger.error('elevenlabs_agent_deletion_error',
        error: e.message,
        backtrace: e.backtrace&.first(3),
        agent_id: agent_id
      )
      {
        success: false,
        error: e.message
      }
    end
  end

  def create_conversation_session(agent_id, user_id)
    begin
      # Get WebRTC token for the agent
      response = self.class.get(
        '/convai/conversation/token',
        headers: headers,
        query: {
          agent_id: agent_id,
          participant_name: user_id
        }
      )
      
      if response.success?
        token_data = response.parsed_response
        {
          success: true,
          conversation_id: "webrtc_#{Time.current.to_i}_#{SecureRandom.hex(8)}", # Generate unique ID
          signed_url: token_data['token']
        }
      else
        Rails.logger.error('elevenlabs_token_request_failed',
          status_code: response.code,
          response_body: response.body,
          agent_id: agent_id
        )
        {
          success: false,
          error: "Failed to get conversation token: #{response.code}"
        }
      end
      
    rescue StandardError => e
      Rails.logger.error('elevenlabs_token_error',
        error: e.message,
        backtrace: e.backtrace&.first(3),
        agent_id: agent_id
      )
      {
        success: false,
        error: e.message
      }
    end
  end
  
  def select_voice_for_persona(persona)
    # Map persona characteristics to appropriate voices
    # Using common ElevenLabs default voices that should be available
    
    characteristics = persona.characteristics
    temper = characteristics['temper_level']
    chattiness = characteristics['chattiness_level']

    case
    when temper > 0.7 && chattiness > 0.7
      # High temper, very chatty - energetic, potentially aggressive voice
      "EXAVITQu4vr4xnSDxMaL" # Bella - assertive female (common default)
    when temper < 0.3 && chattiness > 0.7
      # Calm but chatty - warm, friendly voice
      "21m00Tcm4TlvDq8ikWAM" # Rachel - warm female (common default)
    when temper > 0.7 && chattiness < 0.3
      # High temper, quiet - stern, direct voice  
      "pNInz6obpgDQGcFmaJgB" # Adam - authoritative male (common default)
    when temper < 0.3 && chattiness < 0.3
      # Calm and quiet - gentle, soft voice
      "AZnzlk1XvdvUeBnXmlld" # Domi - gentle female (common default)
    else
      # Moderate characteristics - balanced voice (fallback to Rachel)
      "21m00Tcm4TlvDq8ikWAM" # Rachel - reliable fallback
    end
  rescue StandardError => e
    Rails.logger.warn('voice_selection_failed',
      persona: persona.name,
      error: e.message
    )
    # Fallback to Rachel if voice selection fails
    "21m00Tcm4TlvDq8ikWAM"
  end
  
  private
  
  def headers
    {
      'Content-Type' => 'application/json',
      'xi-api-key' => @api_key
    }
  end
  
  def build_agent_configuration(persona)
    voice_id = select_voice_for_persona(persona)
    prompt = generate_base_prompt(persona)
    voice_settings = generate_voice_settings(persona)
    
    {
      name: "#{persona.name} - Land Seller Agent",
      conversation_config: {
        agent: {
          prompt: {
            prompt: prompt
          },
          first_message: generate_first_message(persona),
          language: "en"
        },
        tts: {
          voice_id: voice_id,
          voice_settings: voice_settings
        },
        conversation: {
          turn_detection: {
            type: "server_vad"
          }
        }
      }
    }
  end
  
  def generate_base_prompt(persona)
    characteristics = persona.characteristics
    
    # Convert characteristics to personality descriptors
    personality_traits = build_personality_description(characteristics)
    motivation_level = determine_motivation_level(characteristics)
    conversation_style = determine_conversation_style(characteristics)
    
    # Use the prompt template from constants
    Prompts::PERSONA_BASE_PROMPT
      .gsub('{persona_name}', persona.name)
      .gsub('{persona_description}', persona.description)
      .gsub('{personality_traits}', personality_traits)
      .gsub('{motivation_level}', motivation_level)
      .gsub('{conversation_style}', conversation_style)
      .strip
  end
  
  def build_personality_description(characteristics)
    traits = []
    
    # Temper level
    case characteristics['temper_level']
    when 0..0.3
      traits << "You are calm and patient, rarely getting upset"
    when 0.3..0.7
      traits << "You have a moderate temperament and can get frustrated if pressured"
    else
      traits << "You have a quick temper and get irritated easily, especially with pushy salespeople"
    end
    
    # Knowledge level
    case characteristics['knowledge_level']
    when 0..0.3
      traits << "You have limited knowledge about real estate transactions and rely on gut feelings"
    when 0.3..0.7
      traits << "You have some knowledge about property sales but aren't an expert"
    else
      traits << "You're well-informed about real estate markets and know your property's value"
    end
    
    # Chattiness level
    case characteristics['chattiness_level']
    when 0..0.3
      traits << "You tend to be quiet and give short, direct answers"
    when 0.3..0.7
      traits << "You're moderately talkative and share some personal details"
    else
      traits << "You're very talkative and love to share stories and details"
    end
    
    # Decision making speed
    case characteristics['decision_making_speed']
    when 0..0.3
      traits << "You take your time making decisions and don't like to be rushed"
    when 0.3..0.7
      traits << "You make decisions at a reasonable pace after considering options"
    else
      traits << "You make quick decisions and like to move fast in negotiations"
    end
    
    traits.join('. ')
  end
  
  def determine_motivation_level(characteristics)
    urgency = characteristics['urgency_level']
    financial_desperation = characteristics['financial_desperation']
    
    combined_motivation = (urgency + financial_desperation) / 2
    
    case combined_motivation
    when 0..0.3
      "You're not in a hurry to sell and will be very selective about offers. You can afford to wait for the right buyer."
    when 0.3..0.7
      "You're interested in selling but want to make sure you get a fair deal. You're open to reasonable negotiations."
    else
      "You're highly motivated to sell due to financial pressures or life circumstances. You're willing to negotiate significantly to close a deal quickly."
    end
  end
  
  def determine_conversation_style(characteristics)
    skepticism = characteristics['skepticism_level']
    emotional_attachment = characteristics['emotional_attachment']
    
    styles = []
    
    if skepticism > 0.7
      styles << "You're naturally skeptical of investors and ask lots of probing questions"
    elsif skepticism > 0.3
      styles << "You're cautious but willing to listen to reasonable proposals"
    else
      styles << "You're generally trusting and open to new opportunities"
    end
    
    if emotional_attachment > 0.7
      styles << "You have strong emotional ties to the property and may get sentimental"
    elsif emotional_attachment > 0.3
      styles << "You have some attachment to the property but can be practical"
    else
      styles << "You view the property purely as a business transaction"
    end
    
    styles.join('. ')
  end
  
  def generate_first_message(persona)
    characteristics = persona.characteristics
    chattiness = characteristics['chattiness_level']
    temper = characteristics['temper_level']
    
    # Generate a greeting based on persona characteristics
    greeting_options = if chattiness > 0.7
      # Very chatty personas
      [
        "Hi there! I heard you might be interested in my property. I'm #{persona.name}, and I'd love to tell you all about it!",
        "Hello! Thanks for calling about my land. I'm #{persona.name}, and boy do I have some stories about this property!",
        "Hey! I'm so glad you reached out. I'm #{persona.name}, and I've been hoping to find the right buyer for my place."
      ]
    elsif chattiness > 0.3
      # Moderately talkative personas
      [
        "Hello, this is #{persona.name}. I understand you're interested in my property?",
        "Hi, I'm #{persona.name}. Thanks for reaching out about my land.",
        "Hello there! I'm #{persona.name}. So you're looking at buying my property?"
      ]
    else
      # Quiet personas
      [
        "Hello. #{persona.name} speaking.",
        "Hi. This is #{persona.name}.",
        "Hello. You called about my property?"
      ]
    end
    
    # Adjust tone based on temper
    selected_greeting = greeting_options.sample
    
    if temper > 0.7
      # Add some edge for high-temper personas
      selected_greeting += " I hope you're serious about this - I don't have time for tire kickers."
    elsif temper < 0.3
      # Add warmth for calm personas
      selected_greeting += " I'm happy to answer any questions you might have."
    end
    
    selected_greeting
  end

  def generate_voice_settings(persona)
    characteristics = persona.characteristics
    
    # Adjust voice settings based on personality
    stability = 0.5 + (characteristics['temper_level'] * 0.3) # Higher temper = less stable
    similarity_boost = 0.7
    style = characteristics['emotional_attachment'] * 0.5 # More attachment = more emotional style
    
    {
      stability: stability.clamp(0, 1),
      similarity_boost: similarity_boost,
      style: style.clamp(0, 1),
      use_speaker_boost: true
    }
  end
end