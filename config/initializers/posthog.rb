# config/initializers/posthog.rb
if Rails.env.production? && ENV['POSTHOG_API_KEY'].present? && ENV['POSTHOG_HOST'].present?
  $posthog = PostHog::Client.new({
    api_key: ENV['POSTHOG_API_KEY'],
    host: ENV['POSTHOG_HOST'],
    on_error: Proc.new { |status, msg| Rails.logger.error("PostHog error: #{msg}") }
  })
else
  # Mock PostHog for development/test
  $posthog = Object.new
  
  def $posthog.capture(*)
    # No-op for development
  end
  
  def $posthog.identify(*)
    # No-op for development  
  end
end