class Persona < ApplicationRecord
  has_many :training_sessions, dependent: :destroy
  
  validates :name, presence: true
  validates :description, presence: true
  validates :characteristics_version, presence: true, numericality: { greater_than: 0 }
  validates :characteristics, presence: true
  
  validate :validate_characteristics_structure
  
  # ElevenLabs agent management
  
  def has_elevenlabs_agent?
    elevenlabs_agent_id.present?
  end
  
  def create_elevenlabs_agent!
    return self if has_elevenlabs_agent?
    
    agent_service = ElevenLabsAgentService.new
    result = agent_service.create_agent_for_persona(self)
    
    if result[:success]
      update!(
        elevenlabs_agent_id: result[:agent_id],
        conversation_prompt: result[:prompt],
        agent_created_at: Time.current
      )
      Rails.logger.info "Created ElevenLabs agent #{result[:agent_id]} for persona #{name}"
    else
      Rails.logger.error "Failed to create ElevenLabs agent for persona #{name}: #{result[:error]}"
      raise StandardError, "Failed to create ElevenLabs agent: #{result[:error]}"
    end
    
    self
  end
  
  private
  
  def validate_characteristics_structure
    return unless characteristics.is_a?(Hash)
    
    required_keys = %w[
      temper_level knowledge_level chattiness_level urgency_level 
      price_flexibility emotional_attachment financial_desperation 
      skepticism_level detail_oriented decision_making_speed
    ]
    
    required_keys.each do |key|
      characteristic = characteristics[key]
      
      unless characteristic.is_a?(Hash)
        errors.add(:characteristics, "#{key} must be a hash with score and description")
        next
      end
      
      unless characteristic['score'].is_a?(Numeric) && characteristic['score'].between?(0, 1)
        errors.add(:characteristics, "#{key} score must be a number between 0 and 1")
      end
      
      unless characteristic['description'].present?
        errors.add(:characteristics, "#{key} description must be present")
      end
    end
  end
end

# == Schema Information
#
# Table name: personas
#
#  id                      :uuid             not null, primary key
#  agent_created_at        :datetime
#  avatar_url              :string
#  characteristics         :json
#  characteristics_version :integer
#  conversation_prompt     :text
#  description             :text
#  name                    :string
#  created_at              :datetime         not null
#  updated_at              :datetime         not null
#  elevenlabs_agent_id     :string
#  voice_id                :string
#
# Indexes
#
#  index_personas_on_elevenlabs_agent_id  (elevenlabs_agent_id) UNIQUE
#  index_personas_on_id                   (id) UNIQUE
#
