# frozen_string_literal: true

class ParcelBlueprint < Blueprinter::Base
  identifier :id

  fields :parcel_number, :location, :property_features, :created_at, :updated_at
end