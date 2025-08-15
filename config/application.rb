require_relative "boot"

require "rails/all"

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module AcquisitionArena
  class Application < Rails::Application
    # Initialize configuration defaults for originally generated Rails version.
    config.load_defaults 8.0

    # Please, add to the `ignore` list any other `lib` subdirectories that do
    # not contain `.rb` files, or that should not be reloaded or eager loaded.
    # Common ones are `templates`, `generators`, or `middleware`, for example.
    config.autoload_lib(ignore: %w[assets tasks])

    # Configuration for the application, engines, and railties goes here.
    #
    # These settings can be overridden in specific environments using the files
    # in config/environments, which are processed later.
    #
    # config.time_zone = "Central Time (US & Canada)"
    # config.eager_load_paths << Rails.root.join("extras")

    # Only loads a smaller set of middleware suitable for API only apps.
    # Middleware like session, flash, cookies can be added back manually.
    # Skip views, helpers and assets when generating a new resource.
    config.api_only = true

    # Load Clerk configuration
    require Rails.root.join('config/clerk.rb')

    # Semantic Logger configuration
    config.semantic_logger.application = 'acquisition_arena'
    config.semantic_logger.environment = Rails.env
    
    # In production, use JSON format to stdout
    if Rails.env.production?
      config.rails_semantic_logger.add_file_appender = false
      config.semantic_logger.add_appender(
        io: $stdout,
        formatter: :json
      )
    end

    # CORS configuration
    config.middleware.use Rack::Cors do
      allow do
        if Rails.env.development?
          origins '*' # Allow all origins in development
        else
          origins ['your-production-domain.com'] # Configure for production
        end
        
        resource '*',
          headers: :any,
          methods: [:get, :post, :put, :patch, :delete, :options, :head],
          credentials: false
      end
    end
  end
end
