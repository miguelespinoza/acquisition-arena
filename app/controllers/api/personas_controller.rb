class Api::PersonasController < ApplicationController

  def index
    personas = Persona.all
    render json: personas.map do |persona|
      {
        id: persona.id,
        name: persona.name,
        description: persona.description,
        avatar_url: persona.avatar_url,
        characteristics: persona.characteristics,
        characteristics_version: persona.characteristics_version
      }
    end
  end
end
