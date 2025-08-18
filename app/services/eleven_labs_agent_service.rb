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

  def update_agent(agent_id, persona)
    begin
      # Generate updated configuration
      agent_config = build_agent_configuration(persona)
      
      # Update agent via ElevenLabs API using PATCH
      response = self.class.patch(
        "/convai/agents/#{agent_id}",
        headers: headers,
        body: agent_config.to_json
      )
      
      if response.success?
        agent_data = response.parsed_response
        
        Rails.logger.info('elevenlabs_agent_updated',
          agent_id: agent_id,
          persona_name: persona.name
        )
        
        {
          success: true,
          agent_id: agent_data['agent_id'] || agent_id,
          prompt: agent_config[:conversation_config][:agent][:prompt][:prompt],
          message: "Agent updated successfully"
        }
      else
        Rails.logger.error('elevenlabs_agent_update_failed',
          status_code: response.code,
          response_body: response.body,
          agent_id: agent_id
        )
        
        # If update fails with 404 or certain errors, try recreating
        if response.code == 404 || response.code == 400
          Rails.logger.info('elevenlabs_agent_update_fallback_to_recreate',
            agent_id: agent_id,
            reason: "Update failed with #{response.code}, attempting recreation"
          )
          
          # Delete the old agent (ignore errors)
          delete_agent(agent_id)
          
          # Create a new agent
          create_agent_for_persona(persona)
        else
          {
            success: false,
            error: "Failed to update agent: #{response.code} - #{response.message}"
          }
        end
      end
      
    rescue StandardError => e
      Rails.logger.error('elevenlabs_agent_update_error',
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
  
  
  private
  
  def headers
    {
      'Content-Type' => 'application/json',
      'xi-api-key' => @api_key
    }
  end
  
  def build_agent_configuration(persona)
    voice_id = persona.voice_id
    prompt = generate_base_prompt(persona)
    voice_settings = generate_voice_settings(persona)
    first_message = generate_first_message(persona)
    
    {
      name: "#{persona.name} - Land Seller Agent",
      conversation_config: {
        agent: {
          prompt: {
            prompt: prompt
          },
          first_message: first_message,
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
    Prompts::LAND_PERSONA_BASE_PROMPT
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
    # Static voice settings for all personas
    {
      stability: 0.7,
      similarity_boost: 0.7,
      style: 0.5,
      use_speaker_boost: true
    }
  end

  def generate_first_message(persona)
    characteristics = persona.characteristics
    
    # Extract relevant personality traits with safe defaults
    temper_level = characteristics.dig('temper_level', 'score') || 0.5
    skepticism_level = characteristics.dig('skepticism_level', 'score') || 0.5
    chattiness_level = characteristics.dig('chattiness_level', 'score') || 0.5
    
    # Generate contextually appropriate first message based on personality
    # The AI is answering the phone, so messages should reflect picking up
    if temper_level > 0.7
      # High temper - more abrupt/annoyed when answering
      ["Yeah?", "What?", "What is it?", "Yeah, what do you want?"].sample
    elsif skepticism_level > 0.7
      # High skepticism - cautious when answering unknown number
      ["Hello?", "Hello... who's this?", "Yes?", "Who's calling?"].sample
    elsif chattiness_level > 0.7
      # High chattiness - more friendly/open when answering
      ["Hello!", "Hi there!", "Hello, this is #{persona.name}!", "Hey there!"].sample
    elsif temper_level < 0.3 && chattiness_level > 0.5
      # Low temper, moderate chattiness - polite greeting
      ["Hello?", "Hello, who's calling please?", "Hi, can I help you?", "Yes, hello?"].sample
    else
      # Default - neutral phone answering variations
      ["Hello?", "Yes?", "Yeah?", "Hello..."].sample
    end
  end
end