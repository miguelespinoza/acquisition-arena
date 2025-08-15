# frozen_string_literal: true

class TrainingSessionBlueprint < Blueprinter::Base
  identifier :id

  fields :status, :session_duration, :conversation_transcript, :audio_url, :elevenlabs_session_token, :created_at, :updated_at

  association :persona, blueprint: PersonaBlueprint
  association :parcel, blueprint: ParcelBlueprint
end