class Api::TrainingSessionsController < ApplicationController
  before_action :set_training_session, only: [:show, :complete]

  def index
    sessions = current_user.training_sessions.includes(:persona, :parcel)
    render json: sessions.map { |session| serialize_session(session) }
  end

  def create
    if current_user.sessions_remaining <= 0
      render json: { error: 'No sessions remaining' }, status: :forbidden
      return
    end

    session = current_user.training_sessions.build(session_params)
    
    if session.save
      current_user.decrement!(:sessions_remaining)
      render json: serialize_session(session), status: :created
    else
      render json: { errors: session.errors }, status: :unprocessable_entity
    end
  end

  def show
    render json: serialize_session(@training_session)
  end

  def complete
    @training_session.update!(
      status: 'completed',
      conversation_transcript: params[:conversation_transcript],
      session_duration: params[:session_duration],
      audio_url: params[:audio_url]
    )

    # TODO: Trigger background grading job
    
    render json: serialize_session(@training_session)
  end

  private

  def set_training_session
    @training_session = current_user.training_sessions.find(params[:id])
  end

  def session_params
    params.require(:training_session).permit(:persona_id, :parcel_id)
  end

  def serialize_session(session)
    {
      id: session.id,
      status: session.status,
      persona: session.persona&.slice(:id, :name, :avatar_url),
      parcel: session.parcel&.slice(:id, :parcel_number, :location),
      grade_stars: session.grade_stars,
      feedback_markdown: session.feedback_markdown,
      session_duration: session.session_duration,
      created_at: session.created_at
    }
  end
end
