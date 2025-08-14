class Api::PersonasController < ApplicationController

  def index
    personas = Persona.all
    render json: PersonaBlueprint.render(personas)
  end
end
