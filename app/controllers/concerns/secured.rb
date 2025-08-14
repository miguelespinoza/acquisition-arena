# frozen_string_literal: true

module Secured
  extend ActiveSupport::Concern

  def current_user
    return @current_user if @current_user

    clerk_user_id = extract_clerk_user_id
    return nil if clerk_user_id.blank?

    @current_user = User.find_by(clerk_user_id: clerk_user_id)

    if @current_user.blank?
      @current_user = User.create!(clerk_user_id: clerk_user_id)
    end

    @current_user
  rescue ActiveRecord::RecordInvalid, PG::UniqueViolation, StandardError => e
    Rails.logger.error "Error finding/creating user: #{e.message}"
    User.find_by(clerk_user_id: clerk_user_id) if clerk_user_id.present?
  end

  private

  def extract_clerk_user_id
    # First try Clerk's middleware if it worked
    if respond_to?(:clerk_user_signed_in?) && clerk_user_signed_in?
      return clerk_user['id']
    end

    # Fallback: manually verify the JWT
    auth_header = request.headers['Authorization']
    return nil if auth_header.blank?

    token = auth_header.split(' ').last
    return nil if token.blank?

    verify_clerk_jwt(token)
  end

  def verify_clerk_jwt(token)
    # Use Clerk SDK to verify the token
    sdk = Clerk::SDK.new(api_key: ENV['CLERK_SECRET_KEY'])
    
    begin
      # Verify token with Clerk
      verification_result = sdk.verify_token(token)
      verification_result['sub'] if verification_result
    rescue => e
      Rails.logger.error "Clerk JWT verification failed: #{e.message}"
      nil
    end
  end
end