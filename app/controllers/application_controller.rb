class ApplicationController < ActionController::API
  include Secured

  before_action :ensure_authenticated
  before_action :set_analytics_user, if: -> { current_user.present? }

  private

  def ensure_authenticated
    render json: { error: 'Unauthorized' }, status: :unauthorized unless current_user.present?
  end

  def set_analytics_user
    Logger.set_user(current_user)
  end
end
