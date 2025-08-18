class Api::FeedbackController < ApplicationController
  def create
    feedback_text = params[:feedback]
    session_id = params[:session_id]
    
    if feedback_text.blank?
      render json: { error: 'Feedback text is required' }, status: :unprocessable_entity
      return
    end

    # If session_id is provided, fetch the training session details
    training_session = nil
    if session_id.present?
      training_session = TrainingSession.find_by(id: session_id)
    end

    # Send to Slack
    slack_service = SlackNotificationService.new
    success = slack_service.send_feedback(
      feedback: feedback_text,
      user: current_user,
      training_session: training_session
    )

    if success
      render json: { message: 'Thank you for your feedback!' }, status: :ok
    else
      render json: { error: 'Failed to submit feedback. Please try again.' }, status: :internal_server_error
    end
  end
end