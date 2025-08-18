class Parcel < ApplicationRecord
  has_many :training_sessions, dependent: :destroy
  
  validates :parcel_number, presence: true, uniqueness: true
  validates :city, presence: true
  validates :state, presence: true
  validates :property_features, presence: true
  
  validate :validate_property_features_structure
  
  def get_conversation_subdetails_prompt
    features_list = property_features.map do |key, value|
      formatted_key = key.to_s.humanize
      formatted_value = format_feature_value(key, value)
      "- #{formatted_key}: #{formatted_value}"
    end.join("\n")
    
    Prompts::LAND_PARCEL_SUB_DETAILS
      .gsub('{city}', city)
      .gsub('{state}', state)
      .gsub('{parcel_number}', parcel_number)
      .gsub('{property_features_list}', features_list)
  end
  
  private
  
  def format_feature_value(key, value)
    case key.to_s
    when 'market_value', 'assessed_value'
      # Format as currency since we're not going through the blueprint
      ActionController::Base.helpers.number_to_currency(value)
    when 'acres'
      "#{value} acres"
    when 'road_frontage'
      "#{value} feet"
    when 'buildability_percentage'
      "#{value}%"
    when 'slope'
      "#{value}% grade"
    when 'fema_coverage', 'wetland_coverage'
      "#{value}%"
    when 'landlocked'
      value ? "Yes" : "No"
    when 'corporate_owned'
      value ? "Yes" : "No"
    else
      value.to_s
    end
  end
  
  def validate_property_features_structure
    return unless property_features.is_a?(Hash)
    
    required_keys = %w[acres market_value]
    optional_keys = %w[
      buildability_percentage landlocked road_frontage assessed_value 
      corporate_owned slope fema_coverage wetland_coverage last_sold
    ]
    
    required_keys.each do |key|
      errors.add(:property_features, "#{key} is required") unless property_features[key].present?
    end
  end
end

# == Schema Information
#
# Table name: parcels
#
#  id                :uuid             not null, primary key
#  city              :string
#  parcel_number     :string
#  property_features :json
#  state             :string
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#
# Indexes
#
#  index_parcels_on_id  (id) UNIQUE
#
