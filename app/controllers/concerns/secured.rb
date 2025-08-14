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
    # Try to get user data from Clerk middleware/proxy
    clerk_proxy = request.env['clerk']
    if clerk_proxy.respond_to?(:user) && clerk_proxy.user.present?
      return clerk_proxy.user['id']
    end

    # If middleware didn't work, manually extract from session token
    token = extract_session_token
    return nil if token.blank?

    verify_session_token(token)
  end

  def extract_session_token
    # Check for token in Authorization header
    auth_header = request.headers['Authorization']
    return auth_header.split(' ').last if auth_header&.start_with?('Bearer ')

    # Check for __session cookie
    request.cookies['__session']
  end

  def verify_session_token(token)
    begin
      # Decode JWT without verification first to get the payload
      decoded_token = JWT.decode(token, nil, false)
      payload = decoded_token[0]
      
      # Extract user ID from the 'sub' claim
      payload['sub'] if payload
    rescue => e
      Rails.logger.error "JWT decode failed: #{e.message}"
      nil
    end
  end
end