class Api::UsersController < ApplicationController

  def profile
    render json: UserBlueprint.render(current_user)
  end

  def validate_invite
    invite_code = params[:invite_code]
    
    if invite_code.blank?
      render json: { error: 'Invite code required' }, status: :bad_request
      return
    end

    # Hard-coded invite code for MVP pilot
    valid_invite_code = "ACQ2025"
    
    if invite_code.upcase == valid_invite_code
      # Mark the user's invite code as redeemed
      current_user.update!(
        invite_code: invite_code.upcase,
        invite_code_redeemed: true,
        sessions_remaining: 5
      )
      
      # Track successful invite redemption
      EventLogger.track('invite_code_redeemed', 
        user_id: current_user.id,
        properties: {
          invite_code: valid_invite_code,
          sessions_granted: 5
        }
      )
      
      render json: { valid: true, message: 'Invite code redeemed successfully!' }
    else
      # Track failed invite attempt
      EventLogger.log_info('invite_code_failed', 
        user_id: current_user.id,
        use_posthog: true,
        attempted_code: invite_code,
        valid_code: valid_invite_code
      )
      
      render json: { valid: false, error: 'Invalid invite code' }, status: :unprocessable_entity
    end
  end

  def request_more_sessions
    user_email = params[:email]
    message = params[:message] || "Love the platform, ready for more sessions!"
    
    if user_email.blank?
      render json: { error: 'Email is required' }, status: :unprocessable_entity
      return
    end

    # Send Slack notification
    slack_service = SlackNotificationService.new
    success = slack_service.send_more_sessions_request(
      user_email: user_email,
      user: current_user,
      message: message,
      sessions_completed: current_user.training_sessions.where(status: 'completed').count
    )

    if success
      render json: { message: "Thank you for your interest! We'll respond within a couple of hours." }
    else
      render json: { error: 'Failed to send request. Please try again.' }, status: :internal_server_error
    end
  rescue StandardError => e
    Rails.logger.error "Failed to send more sessions request: #{e.message}"
    render json: { error: 'Failed to send request. Please try again.' }, status: :internal_server_error
  end
end
