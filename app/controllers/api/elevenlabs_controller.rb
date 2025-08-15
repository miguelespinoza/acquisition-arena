class Api::ElevenlabsController < ApplicationController
  include Secured

  def session_token
    training_session = current_user.training_sessions.find(params[:training_session_id])
    
    if training_session.status != 'pending'
      render json: { error: 'Session already started' }, status: :bad_request
      return
    end

    # Ensure persona has an ElevenLabs agent
    persona = training_session.persona
    unless persona.has_elevenlabs_agent?
      render json: { error: 'Persona does not have an ElevenLabs agent. Please contact support.' }, status: :unprocessable_entity
      return
    end

    # Generate actual ElevenLabs session token
    result = generate_elevenlabs_session(training_session)
    
    if result[:success]
      training_session.update!(
        status: 'active',
        elevenlabs_session_token: result[:signed_url]
      )

      render json: { 
        token: result[:signed_url],
        conversation_id: result[:conversation_id],
        agent_id: persona.elevenlabs_agent_id
      }
    else
      render json: { error: result[:error] }, status: :unprocessable_entity
    end
  end

  private

  def generate_elevenlabs_session(training_session)
    persona = training_session.persona
    user_id = current_user.clerk_user_id || current_user.id.to_s
    
    # Log the session creation attempt
    logger.info('elevenlabs_session_start', 
      persona: persona.name, 
      agent_id: persona.elevenlabs_agent_id,
      training_session_id: training_session.id
    )
    
    # Create conversation session using ElevenLabs service
    service = ElevenLabsAgentService.new
    result = service.create_conversation_session(persona.elevenlabs_agent_id, user_id)
    
    if result[:success]
      logger.info('elevenlabs_session_created', 
        conversation_id: result[:conversation_id],
        persona: persona.name
      )
    else
      logger.error('elevenlabs_session_failed', 
        error: result[:error],
        persona: persona.name,
        agent_id: persona.elevenlabs_agent_id
      )
    end
    
    result
  rescue StandardError => e
    logger.error('elevenlabs_session_error', 
      error: e.message,
      backtrace: e.backtrace&.first(3),
      persona: persona.name
    )
    {
      success: false,
      error: "Failed to create voice session: #{e.message}"
    }
  end
end
