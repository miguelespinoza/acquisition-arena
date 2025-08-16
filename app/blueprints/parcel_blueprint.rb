# frozen_string_literal: true

class ParcelBlueprint < Blueprinter::Base
  identifier :id

  fields :parcel_number, :city, :state, :property_features, :created_at, :updated_at
end