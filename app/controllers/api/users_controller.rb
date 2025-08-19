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
      
      render json: { valid: true, message: 'Invite code redeemed successfully!' }
    else
      render json: { valid: false, error: 'Invalid invite code' }, status: :unprocessable_entity
    end
  end
end
