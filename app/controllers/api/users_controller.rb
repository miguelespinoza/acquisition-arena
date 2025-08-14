class Api::UsersController < ApplicationController

  def profile
    render json: {
      id: current_user.id,
      clerk_user_id: current_user.clerk_user_id,
      sessions_remaining: current_user.sessions_remaining,
      invite_code_redeemed: current_user.invite_code_redeemed
    }
  end

  def validate_invite
    invite_code = params[:invite_code]
    
    if invite_code.blank?
      render json: { error: 'Invite code required' }, status: :bad_request
      return
    end

    # TODO: Implement invite code validation logic
    render json: { valid: true }
  end
end
