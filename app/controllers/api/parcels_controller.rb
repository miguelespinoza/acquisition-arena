class Api::ParcelsController < ApplicationController

  def index
    parcels = Parcel.all
    render json: ParcelBlueprint.render(parcels)
  end
end
