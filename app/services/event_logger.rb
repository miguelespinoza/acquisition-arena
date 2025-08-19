# app/services/event_logger.rb
class EventLogger
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
    
    # Set user context for Rollbar (always, regardless of environment)
    if defined?(Rollbar) && Rollbar.configuration.enabled
      Rollbar.scope!(person: {
        id: user.id,
        email: user.email_address,
        first_name: user.first_name,
        last_name: user.last_name
      })
    end
    
    # Set user for PostHog (production only)
    if Rails.env.production?
      $posthog.identify({
        distinct_id: user.id.to_s,
        properties: {
          id: user.id.to_s,
          email: user.email_address,
          first_name: user.first_name,
          last_name: user.last_name
        }
      })
    end
  rescue => e
    Rails.logger.error "User identification failed: #{e.message}"
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

  # Unified error capture for both Rollbar and PostHog
  def self.capture_error(message, exception: nil, user_id: nil, **properties)
    # Always log to Rails logger
    if exception
      Rails.logger.error "#{message}: #{exception.message}"
      Rails.logger.error exception.backtrace.join("\n") if exception.backtrace
    else
      Rails.logger.error message
    end
    
    # Send to Rollbar if available and enabled
    if defined?(Rollbar) && Rollbar.configuration.enabled
      if exception
        Rollbar.error(exception, message: message, **properties)
      else
        Rollbar.error(message, **properties)
      end
    end
    
    # Send to PostHog in production if user_id provided
    if Rails.env.production? && user_id.present?
      error_data = properties.merge(
        message: message,
        level: 'error'
      )
      
      if exception
        error_data.merge!(
          exception_class: exception.class.name,
          exception_message: exception.message,
          backtrace: exception.backtrace&.first(5)
        )
      end
      
      track('rails_error', user_id: user_id, properties: error_data)
    end
  rescue => e
    # Fallback logging if error tracking fails
    Rails.logger.error "Error tracking failed: #{e.message}"
  end
end