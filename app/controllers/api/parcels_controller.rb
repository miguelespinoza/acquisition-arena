class Api::ParcelsController < ApplicationController

  def index
    parcels = Parcel.all
    render json: parcels.map do |parcel|
      {
        id: parcel.id,
        parcel_number: parcel.parcel_number,
        location: parcel.location,
        property_features: parcel.property_features
      }
    end
  end
end
