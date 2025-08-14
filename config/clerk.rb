# frozen_string_literal: true

if ENV['CLERK_SECRET_KEY'].present?
  Clerk.configure do |c|
    c.api_key = ENV['CLERK_SECRET_KEY']
    c.logger = Logger.new(STDOUT) if Rails.env.development?
  end
end