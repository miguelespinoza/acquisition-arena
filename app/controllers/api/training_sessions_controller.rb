class Api::TrainingSessionsController < ApplicationController
  before_action :set_training_session, only: [:show, :complete]

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
      session_duration: params[:session_duration],
      audio_url: params[:audio_url]
    )

    
    render json: TrainingSessionBlueprint.render(@training_session)
  end

  private

  def set_training_session
    @training_session = current_user.training_sessions.find(params[:id])
  end

  def session_params
    params.require(:training_session).permit(:persona_id, :parcel_id)
  end
end
