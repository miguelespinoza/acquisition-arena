# frozen_string_literal: true

module Secured
  extend ActiveSupport::Concern

  def current_user
    return @current_user if @current_user
    return nil unless clerk_user_signed_in?

    clerk_user_id = clerk_user['id']
    @current_user = User.find_by(clerk_user_id: clerk_user_id)

    if @current_user.blank?
      @current_user = User.create!(clerk_user_id: clerk_user_id)
    end

    @current_user
  rescue ActiveRecord::RecordInvalid, PG::UniqueViolation, StandardError => e
    Rails.logger.error "Error finding/creating user: #{e.message}"
    User.find_by(clerk_user_id: clerk_user_id) if clerk_user_id.present?
  end
end