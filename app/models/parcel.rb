class Parcel < ApplicationRecord
  has_many :training_sessions, dependent: :destroy
  
  validates :parcel_number, presence: true, uniqueness: true
  validates :location, presence: true
  validates :property_features, presence: true
  
  validate :validate_property_features_structure
  
  private
  
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
#  location          :string
#  parcel_number     :string
#  property_features :json
#  created_at        :datetime         not null
#  updated_at        :datetime         not null
#
# Indexes
#
#  index_parcels_on_id  (id) UNIQUE
#
