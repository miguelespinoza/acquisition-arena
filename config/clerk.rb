# frozen_string_literal: true

Clerk.configure do |c|
  c.secret_key = ENV['CLERK_SECRET_KEY']
  c.logger = Logger.new(STDOUT)
end