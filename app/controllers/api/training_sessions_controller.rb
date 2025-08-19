class Api::TrainingSessionsController < ApplicationController
  before_action :set_training_session, only: [:show, :complete, :start_conversation, :end_conversation]

  def index
    sessions = current_user.training_sessions.includes(:persona, :parcel)
    render json: TrainingSessionBlueprint.render(sessions)
  end

  def create
    if current_user.sessions_remaining <= 0
      render json: { error: 'No sessions remaining' }, status: :forbidden
      return
    end

    session = current_user.training_sessions.build(session_params)
    
    if session.save
      current_user.decrement!(:sessions_remaining)
      render json: TrainingSessionBlueprint.render(session), status: :created
    else
      render json: { errors: session.errors }, status: :unprocessable_entity
    end
  end

  def show
    render json: TrainingSessionBlueprint.render(@training_session)
  end

  def complete
    @training_session.update!(
      status: 'completed',
      conversation_transcript: params[:conversation_transcript],
      session_duration_in_seconds: params[:session_duration],
      audio_url: params[:audio_url]
    )

    
    render json: TrainingSessionBlueprint.render(@training_session)
  end

  def start_conversation
    if @training_session.status != 'pending'
      render json: { error: 'Session already started' }, status: :bad_request
      return
    end

    # Ensure persona has an ElevenLabs agent
    persona = @training_session.persona
    unless persona.has_elevenlabs_agent?
      render json: { error: 'Persona does not have an ElevenLabs agent. Please contact support.' }, status: :unprocessable_entity
      return
    end

    # Generate parcel sub-prompt
    parcel = @training_session.parcel
    parcel_details = parcel.get_conversation_subdetails_prompt

    # Generate actual ElevenLabs session token
    result = generate_elevenlabs_session(@training_session)
    
    if result[:success]
      @training_session.update!(
        status: 'active',
        elevenlabs_session_token: result[:signed_url]
      )

      render json: { 
        token: result[:signed_url],
        agent_id: persona.elevenlabs_agent_id,
        dynamic_variables: {
          land_parcel_sub_details: parcel_details
        }
      }
    else
      render json: { error: result[:error] }, status: :unprocessable_entity
    end
  end

  def end_conversation
    if @training_session.status != 'active'
      render json: { error: 'Session is not active' }, status: :bad_request
      return
    end

    # Update status and store the ElevenLabs conversation ID
    update_params = { status: 'generating_feedback' }
    update_params[:elevenlabs_conversation_id] = params[:elevenlabs_conversation_id] if params[:elevenlabs_conversation_id].present?
    @training_session.update!(update_params)

    # Log feedback generation started
    Logger.log_info('feedback_generation_started', 
      user_id: current_user.id,
      use_posthog: true,
      training_session_id: @training_session.id,
      persona_id: @training_session.persona_id,
      elevenlabs_conversation_id: params[:elevenlabs_conversation_id]
    )

    # Queue the feedback generation job
    TrainingSessionFeedbackJob.perform_later(@training_session.id)

    # Return the updated session
    render json: TrainingSessionBlueprint.render(@training_session)
  end

  private

  def set_training_session
    @training_session = current_user.training_sessions.find(params[:id])
  end

  def session_params
    params.require(:training_session).permit(:persona_id, :parcel_id)
  end

  def generate_elevenlabs_session(training_session)
    persona = training_session.persona
    user_id = current_user.clerk_user_id || current_user.id.to_s
    
    # Log the session creation attempt
    Logger.log_info('elevenlabs_session_start', 
      user_id: current_user.id,
      use_posthog: true,
      persona: persona.name, 
      agent_id: persona.elevenlabs_agent_id,
      training_session_id: training_session.id
    )
    
    # Create conversation session using ElevenLabs service
    service = ElevenLabsAgentService.new
    result = service.create_conversation_session(persona.elevenlabs_agent_id, user_id)
    
    if result[:success]
      Logger.log_info('elevenlabs_session_created', 
        user_id: current_user.id,
        use_posthog: true,
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
