class Persona < ApplicationRecord
  has_many :training_sessions, dependent: :destroy
  
  validates :name, presence: true
  validates :description, presence: true
  validates :characteristics_version, presence: true, numericality: { greater_than: 0 }
  validates :characteristics, presence: true
  
  validate :validate_characteristics_structure
  
  private
  
  def validate_characteristics_structure
    return unless characteristics.is_a?(Hash)
    
    required_keys = %w[
      temper_level knowledge_level chattiness_level urgency_level 
      price_flexibility emotional_attachment financial_desperation 
      skepticism_level detail_oriented decision_making_speed
    ]
    
    required_keys.each do |key|
      unless characteristics[key].is_a?(Numeric) && characteristics[key].between?(0, 1)
        errors.add(:characteristics, "#{key} must be a number between 0 and 1")
      end
    end
  end
end
