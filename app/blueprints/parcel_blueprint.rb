# frozen_string_literal: true

class ParcelBlueprint < Blueprinter::Base
  identifier :id

  fields :parcel_number, :city, :state, :created_at, :updated_at
  
  # Transform property_features to format monetary values
  field :property_features do |parcel|
    features = parcel.property_features.dup
    
    # Override monetary values with formatted currency strings
    if features['market_value']
      features['market_value'] = ActionController::Base.helpers.number_to_currency(features['market_value'])
    end
    
    if features['assessed_value']
      features['assessed_value'] = ActionController::Base.helpers.number_to_currency(features['assessed_value'])
    end
    
    features
  end
end