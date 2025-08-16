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
          first_message: "Hello?",
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
    
    # Format all characteristics for the prompt
    formatted_characteristics = format_all_characteristics(characteristics)
    
    # Use the prompt template from constants
    Prompts::PERSONA_BASE_PROMPT
      .gsub('{persona_name}', persona.name)
      .gsub('{persona_description}', persona.description)
      .gsub('{characteristics}', formatted_characteristics)
      .strip
  end
  
  
  def format_all_characteristics(characteristics)
    formatted_traits = []
    
    characteristics.each do |trait_name, trait_data|
      if trait_data.is_a?(Hash) && trait_data['score'] && trait_data['description']
        # Format: "- Trait Name (score): description"
        formatted_name = trait_name.humanize
        score = trait_data['score']
        description = trait_data['description']
        formatted_traits << "- #{formatted_name} (#{score}): #{description}"
      end
    end
    
    formatted_traits.join("\n")
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