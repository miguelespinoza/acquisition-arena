class TrainingSessionFeedbackJob < ApplicationJob
  queue_as :default

  def perform(training_session_id)
    training_session = TrainingSession.find(training_session_id)
    
    # Fetch transcript from ElevenLabs
    transcript = fetch_transcript_from_elevenlabs(training_session)
    
    if transcript
      # Save transcript
      training_session.update!(conversation_transcript: transcript)
      
      # Generate feedback using GPT-4
      feedback = generate_feedback(transcript, training_session)
      
      # Save feedback
      training_session.update!(
        feedback_score: feedback[:score],
        feedback_text: feedback[:text],
        feedback_generated_at: Time.current,
        status: 'completed'
      )
      
      logger.info "Feedback generated for training session #{training_session_id}"
    else
      # Mark as failed if we couldn't get transcript
      training_session.update!(status: 'failed')
      logger.error "Failed to fetch transcript for training session #{training_session_id}"
    end
  rescue StandardError => e
    logger.error "Error generating feedback for training session #{training_session_id}: #{e.message}"
    training_session&.update!(status: 'failed')
    raise
  end

  private

  def fetch_transcript_from_elevenlabs(training_session)
    unless training_session.elevenlabs_conversation_id.present?
      logger.error "No ElevenLabs conversation ID found for training session #{training_session.id}"
      return nil
    end
    
    logger.info "Fetching transcript for conversation ID: #{training_session.elevenlabs_conversation_id}"
    
    service = ElevenLabsAgentService.new
    result = service.get_conversation_transcript(training_session.elevenlabs_conversation_id)
    
    if result[:success]
      logger.info "Successfully fetched transcript with #{result[:transcript]&.length || 0} messages"
      format_transcript(result[:transcript])
    else
      logger.error "Failed to fetch transcript: #{result[:error]}"
      nil
    end
  end

  def format_transcript(transcript_data)
    # Format the transcript from ElevenLabs response
    # Assuming transcript_data is an array of message objects
    return "" unless transcript_data.is_a?(Array)
    
    transcript_data.map do |message|
      role = message['role'] || message[:role] || 'unknown'
      text = message['text'] || message[:text] || message['message'] || message[:message] || ''
      "#{role.capitalize}: #{text}"
    end.join("\n\n")
  end

  def generate_feedback(transcript, training_session)
    persona = training_session.persona
    parcel = training_session.parcel
    
    # Build the prompt using the template from constants
    prompt = Prompts::LAND_SESSION_FEEDBACK_CONTEXT_PROMPT
      .gsub('{{persona_name}}', persona.name)
      .gsub('{{persona_characteristics}}', persona.characteristics.to_json)
      .gsub('{{property_features}}', parcel.property_features.to_json)
      .gsub('{{transcript}}', transcript)
    
    # Call GPT-4 to analyze the conversation
    response = call_gpt4(prompt)
    
    # Parse the response
    parse_feedback_response(response)
  end

  def call_gpt4(prompt)
    service = TrainingSessionFeedbackService.new(logger: logger)
    response = service.generate_feedback(prompt)
    
    # Convert to JSON string if it's a hash (from parsed response)
    response.is_a?(Hash) ? response.to_json : response
  end

  def parse_feedback_response(response)
    begin
      data = JSON.parse(response)
      
      # Build markdown formatted feedback text
      feedback_text = build_markdown_feedback(data)
      
      {
        score: data['score'] || 0,
        text: feedback_text
      }
    rescue JSON::ParserError => e
      logger.error "Failed to parse GPT-4 response: #{e.message}"
      {
        score: 0,
        text: "Unable to generate feedback at this time. Please try again later."
      }
    end
  end

  def build_markdown_feedback(data)
    markdown = []
    
    # Summary at the top
    markdown << "## Summary\n\n#{data['summary']}\n" if data['summary']
    
    # Strengths
    if data['strengths'] && data['strengths'].any?
      markdown << "## What You Did Well\n"
      data['strengths'].each do |strength|
        markdown << "- #{strength}"
      end
      markdown << ""
    end
    
    # Areas for Improvement
    if data['improvements'] && data['improvements'].any?
      markdown << "## Areas to Improve\n"
      data['improvements'].each do |improvement|
        markdown << "- #{improvement}"
      end
      markdown << ""
    end
    
    # Key Moments
    if data['key_moments'] && data['key_moments'].any?
      markdown << "## Key Conversation Moments\n"
      data['key_moments'].each do |moment|
        markdown << "- #{moment}"
      end
      markdown << ""
    end
    
    # Coaching Tip
    if data['coaching_tip']
      markdown << "## Coaching Tip\n\n**#{data['coaching_tip']}**"
    end
    
    markdown.join("\n")
  end
end