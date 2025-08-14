# frozen_string_literal: true

class PersonaBlueprint < Blueprinter::Base
  identifier :id

  fields :name, :description, :avatar_url, :characteristics, :characteristics_version, :created_at, :updated_at
end