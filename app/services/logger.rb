# app/services/logger.rb
class Logger
  def self.track(event, user_id: nil, properties: {})
    return unless user_id.present? # Only track authenticated users
    return unless Rails.env.production? # Only track in production
    
    $posthog.capture({
      distinct_id: user_id.to_s,
      event: event,
      properties: properties
    })
  rescue => e
    Rails.logger.error "Analytics tracking failed: #{e.message}"
  end

  def self.set_user(user)
    return unless user&.id.present?
    return unless Rails.env.production?
    
    $posthog.identify({
      distinct_id: user.id.to_s,
      properties: {
        id: user.id.to_s,
        email: user.email_address,
        first_name: user.first_name,
        last_name: user.last_name
      }
    })
  rescue => e
    Rails.logger.error "Analytics user identification failed: #{e.message}"
  end

  # Helper method to log info messages with optional PostHog tracking
  def self.log_info(message, user_id: nil, use_posthog: false, **payload)
    # Always log to Rails logger
    Rails.logger.info(message, payload.merge(user_id: user_id).compact)
    
    # Optionally also track to PostHog when explicitly requested
    if use_posthog && user_id.present?
      track('rails_log_info', user_id: user_id, properties: payload.merge(
        message: message,
        level: 'info'
      ))
    end
  end
end