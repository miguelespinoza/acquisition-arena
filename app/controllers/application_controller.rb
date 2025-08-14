class ApplicationController < ActionController::API
  include Secured

  before_action :ensure_authenticated

  private

  def ensure_authenticated
    render json: { error: 'Unauthorized' }, status: :unauthorized unless current_user.present?
  end
end
