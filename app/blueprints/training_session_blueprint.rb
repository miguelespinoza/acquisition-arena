# frozen_string_literal: true

class TrainingSessionBlueprint < Blueprinter::Base
  identifier :id

  fields :status, :grade_stars, :feedback_markdown, :session_duration, :created_at, :updated_at

  association :persona, blueprint: PersonaBlueprint, view: :basic
  association :parcel, blueprint: ParcelBlueprint, view: :basic

  view :basic do
    exclude :persona, :parcel
  end

  view :detailed do
    fields :conversation_transcript, :audio_url, :elevenlabs_session_token
  end
end