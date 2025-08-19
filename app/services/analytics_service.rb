# app/services/analytics_service.rb
class AnalyticsService
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
end