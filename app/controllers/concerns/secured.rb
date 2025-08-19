# frozen_string_literal: true

module Secured
  extend ActiveSupport::Concern

  def current_user
    return @current_user if @current_user
    
    # Access clerk_user from the request env set by middleware
    clerk_data = request.env['clerk']
    return nil if clerk_data.blank? || clerk_data&.user.blank?
    
    clerk_user = clerk_data.user
    clerk_user_id = clerk_user.id  # Access as method, not hash
    
    @current_user = User.find_by(clerk_user_id: clerk_user_id)

    if @current_user.blank?
      # Extract email from clerk user data - email_addresses is an array of EmailAddress objects
      email = clerk_user.email_addresses&.first&.email_address if clerk_user.email_addresses&.any?
      
      @current_user = User.create!(
        clerk_user_id: clerk_user_id,
        email_address: email,
        first_name: clerk_user.first_name,
        last_name: clerk_user.last_name
      )
      
      # Track user signup
      Logger.track('user_signed_up', 
        user_id: @current_user.id,
        properties: {
          clerk_user_id: clerk_user_id,
          email: email,
          has_name: clerk_user.first_name.present?
        }
      )
    else
      # Update user name if it has changed
      if @current_user.first_name != clerk_user.first_name || @current_user.last_name != clerk_user.last_name
        @current_user.update(
          first_name: clerk_user.first_name,
          last_name: clerk_user.last_name
        )
      end
    end

    @current_user
  rescue ActiveRecord::RecordInvalid, PG::UniqueViolation, StandardError => e
    Logger.capture_error("Error finding/creating user", exception: e, clerk_user_id: clerk_user_id)
    User.find_by(clerk_user_id: clerk_user_id) if defined?(clerk_user_id) && clerk_user_id.present?
  end
end