require 'clerk/authenticatable'

class ApplicationController < ActionController::API
  include Clerk::Authenticatable
  include Secured

  before_action :ensure_authenticated

  private

  def ensure_authenticated
    render json: { error: 'Unauthorized' }, status: :unauthorized unless current_user.present?
  end
end
