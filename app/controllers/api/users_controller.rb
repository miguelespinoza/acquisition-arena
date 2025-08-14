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

    # TODO: Implement invite code validation logic
    render json: { valid: true }
  end
end
