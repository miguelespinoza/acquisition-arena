require 'openai'

class TrainingSessionFeedbackService
  attr_reader :client, :logger

  def initialize(logger: Rails.logger)
    @logger = logger
    api_key = ENV['OPENAI_API_KEY']
    
    if api_key.present? && api_key != 'your_openai_api_key_here'
      @client = OpenAI::Client.new(access_token: api_key)
    else
      @client = nil
      logger.warn "OpenAI API key not configured"
    end
  end

  def generate_feedback(prompt)
    # If no client (no API key), raise error
    unless client
      logger.error "OpenAI client not initialized - API key missing or invalid"
      raise "OpenAI API key not configured. Please set OPENAI_API_KEY environment variable."
    end

    begin
      response = client.chat(
        parameters: {
          model: model_name,
          messages: build_messages(prompt),
          temperature: 0.7,
          max_tokens: 2000,
          response_format: structured_output_format
        }
      )
      
      content = response.dig("choices", 0, "message", "content")
      
      if content.present?
        logger.info "Successfully generated GPT feedback"
        parse_response(content)
      else
        logger.error "GPT returned empty response"
        raise "GPT-4 returned empty response. Please try again."
      end
      
    rescue => e
      handle_error(e)
      raise
    end
  end

  private

  def model_name
    # Use gpt-4o-mini for cost efficiency, or gpt-4o for better quality
    # Note: Structured outputs require gpt-4o-mini or gpt-4o-2024-08-06 or later
    ENV.fetch('GPT_MODEL', 'gpt-4o-mini')
  end

  def structured_output_format
    # Check if model supports structured outputs
    if model_name.include?('gpt-4o') || model_name.include?('gpt-4o-mini')
      # Use structured outputs with JSON schema for better reliability
      {
        type: "json_schema",
        json_schema: {
          name: "training_feedback",
          strict: true,
          schema: {
            type: "object",
            properties: {
              score: {
                type: "integer",
                description: "Overall performance score from 0-100",
                minimum: 0,
                maximum: 100
              },
              strengths: {
                type: "array",
                description: "List of things the investor did well",
                items: { type: "string" },
                minItems: 2,
                maxItems: 5
              },
              improvements: {
                type: "array",
                description: "Areas where the investor can improve",
                items: { type: "string" },
                minItems: 2,
                maxItems: 5
              },
              key_moments: {
                type: "array",
                description: "Notable moments in the conversation",
                items: { type: "string" },
                minItems: 2,
                maxItems: 5
              },
              coaching_tip: {
                type: "string",
                description: "One specific, actionable tip for improvement"
              },
              summary: {
                type: "string",
                description: "2-3 sentence overall assessment"
              }
            },
            required: ["score", "strengths", "improvements", "key_moments", "coaching_tip", "summary"],
            additionalProperties: false
          }
        }
      }
    else
      # Fallback to basic JSON mode for older models
      { type: "json_object" }
    end
  end

  def build_messages(prompt)
    [
      {
        role: "system",
        content: Prompts::LAND_SESSION_FEEDBACK_SYSTEM_PROMPT
      },
      {
        role: "user",
        content: prompt
      }
    ]
  end

  def parse_response(content)
    JSON.parse(content)
  rescue JSON::ParserError => e
    logger.error "Failed to parse GPT response as JSON: #{e.message}"
    logger.error "Response was: #{content}"
    raise "Failed to parse GPT response. The AI returned an invalid format."
  end

  def handle_error(error)
    case error
    when OpenAI::RateLimitError
      logger.error "OpenAI rate limit exceeded: #{error.message}"
    when OpenAI::APIError
      logger.error "OpenAI API error: #{error.message}"
    else
      logger.error "Error calling OpenAI: #{error.class} - #{error.message}"
      logger.error error.backtrace.first(5).join("\n") if error.backtrace
    end
  end

end