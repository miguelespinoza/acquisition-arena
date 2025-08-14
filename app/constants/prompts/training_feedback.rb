module Prompts
  # Feedback generation prompt for AI evaluation of training sessions
  TRAINING_FEEDBACK_PROMPT = <<~PROMPT
      Analyze this land acquisition roleplay conversation and provide detailed feedback.
      
      CONTEXT:
      - Student was practicing acquisition calls with an AI seller
      - Seller persona: {persona_name} ({conversation_style}, {motivation_level} motivation)
      - Property: {property_type} in {property_location}
      - Expected objections: {objection_patterns}
      
      SESSION METRICS:
      - Total duration: {duration_seconds} seconds
      - Number of exchanges: {exchange_count}
      - Student speaking time: {student_speaking_seconds} seconds
      - Objections covered: {objections_covered}
      
      CONVERSATION TRANSCRIPT:
      {transcript}
      
      Please provide feedback in JSON format with:
      1. overallScore (1-10)
      2. strengths (array of positive observations)
      3. areasForImprovement (array of specific areas to work on)
      4. specificFeedback (scores 1-10 for rapportBuilding, objectionHandling, questionQuality, closingTechnique)
      5. recommendations (array of actionable next steps)
      
      Focus on practical land acquisition techniques and communication skills.
    PROMPT
end