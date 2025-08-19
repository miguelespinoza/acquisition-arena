Rollbar.configure do |config|
  config.access_token = ENV['ROLLBAR_ACCESS_TOKEN']

  # Silence the rollbar logger in development to avoid noise
  config.logger = Rails.logger

  # Enable and disable Rollbar reporting
  if Rails.env.development?
    config.enabled = ENV['ROLLBAR_ENABLED'].present? && ENV['ROLLBAR_ENABLED'] == 'true'
  else
    config.enabled = ENV['ROLLBAR_ACCESS_TOKEN'].present?
  end

  # Skip reporting errors in test environment unless explicitly enabled
  config.enabled = false if Rails.env.test? && !ENV['ROLLBAR_ENABLED']

  # Add custom metadata to all Rollbar reports
  config.transform << proc do |options|
    if current_user = Thread.current[:current_user]
      options[:person] = {
        id: current_user.id,
        email: current_user.email_address,
        first_name: current_user.first_name,
        last_name: current_user.last_name
      }
    end

    # Add environment info
    options[:custom] ||= {}
    options[:custom][:rails_env] = Rails.env
    options[:custom][:application] = 'acquisition_arena'
  end

  # Set the exception level
  config.exception_level_filters.merge!(
    'ActionController::RoutingError' => 'ignore',
    'AbstractController::ActionNotFound' => 'ignore',
    'ActionController::UnknownFormat' => 'ignore'
  )

  # Filter sensitive data
  config.scrub_fields |= %w[
    password
    password_confirmation
    secret
    token
    api_key
    access_token
    refresh_token
    clerk_secret_key
    elevenlabs_api_key
    openai_api_key
    posthog_api_key
  ]

  config.scrub_headers |= %w[
    Authorization
    X-API-Key
    X-Access-Token
  ]
end