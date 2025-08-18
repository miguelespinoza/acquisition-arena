# frozen_string_literal: true

class PersonaBlueprint < Blueprinter::Base
  identifier :id

  fields :name, :description, :avatar_url, :characteristics, :characteristics_version, :elevenlabs_agent_id, :conversation_prompt, :agent_created_at, :voice_id, :created_at, :updated_at
end