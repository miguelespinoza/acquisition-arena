class Api::ElevenlabsController < ApplicationController

  def session_token
    training_session = current_user.training_sessions.find(params[:training_session_id])
    
    if training_session.status != 'pending'
      render json: { error: 'Session already started' }, status: :bad_request
      return
    end

    # TODO: Generate actual ElevenLabs session token
    token = generate_elevenlabs_token(training_session)
    
    training_session.update!(
      status: 'active',
      elevenlabs_session_token: token
    )

    render json: { token: token }
  end

  private

  def generate_elevenlabs_token(training_session)
    # TODO: Implement actual ElevenLabs API call
    # This should create a conversation session with system prompt
    system_prompt = build_system_prompt(training_session)
    
    Rails.logger.info "System prompt: #{system_prompt}"
    
    # Placeholder token
    "elevenlabs_token_#{SecureRandom.hex(16)}"
  end

  def build_system_prompt(training_session)
    persona = training_session.persona
    parcel = training_session.parcel
    
    <<~PROMPT
      You are #{persona.name}. #{persona.description}
      
      Personality characteristics:
      - Temper level: #{persona.characteristics['temper_level']}
      - Knowledge level: #{persona.characteristics['knowledge_level']}  
      - Chattiness: #{persona.characteristics['chattiness_level']}
      - Urgency: #{persona.characteristics['urgency_level']}
      - Price flexibility: #{persona.characteristics['price_flexibility']}
      
      You own a property with these details:
      - Location: #{parcel.location}
      - Parcel Number: #{parcel.parcel_number}
      - Acres: #{parcel.property_features['acres']}
      - Market Value: $#{parcel.property_features['market_value']}
      
      The caller is a land investor interested in potentially buying your property. 
      Respond naturally according to your personality traits.
    PROMPT
  end
end
