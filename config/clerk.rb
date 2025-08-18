# frozen_string_literal: true

Clerk.configure do |c|
  c.secret_key = ENV['CLERK_SECRET_KEY']  # Changed from api_key to secret_key in v4
  c.logger = Logger.new(STDOUT) if Rails.env.development?
  # For Rails API mode - we'll manually handle middleware
end