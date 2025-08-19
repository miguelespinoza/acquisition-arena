# frozen_string_literal: true

require_relative '../utils/grade_calculator'

class TrainingSessionBlueprint < Blueprinter::Base
  identifier :id

  fields :status, :session_duration_in_seconds, :conversation_transcript, :audio_url, :elevenlabs_session_token, 
         :feedback_score, :feedback_text, :feedback_generated_at, :created_at, :updated_at

  field :feedback_grade do |session|
    GradeCalculator.calculate_grade(session.feedback_score)
  end

  association :persona, blueprint: PersonaBlueprint
  association :parcel, blueprint: ParcelBlueprint
end