class Api::HomeController < ApplicationController
  def index
    render json: {
      user: UserBlueprint.render_as_hash(current_user)
    }
  end
end