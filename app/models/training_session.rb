class TrainingSession < ApplicationRecord
  belongs_to :user
  belongs_to :persona
  belongs_to :parcel
  
  validates :status, inclusion: { in: %w[pending active generating_feedback completed failed] }
  validates :session_duration, numericality: { greater_than: 0 }, allow_nil: true
  
  before_validation :set_defaults
  
  scope :completed, -> { where(status: 'completed') }
  scope :for_user, ->(user) { where(user: user) }
  
  def completed?
    status == 'completed'
  end
  
  
  private
  
  def set_defaults
    self.status ||= 'pending'
  end
end

# == Schema Information
#
# Table name: training_sessions
#
#  id                         :uuid             not null, primary key
#  audio_url                  :string
#  conversation_transcript    :text
#  elevenlabs_session_token   :string
#  feedback_generated_at      :datetime
#  feedback_score             :integer
#  feedback_text              :text
#  session_duration           :integer
#  status                     :string
#  created_at                 :datetime         not null
#  updated_at                 :datetime         not null
#  elevenlabs_conversation_id :string
#  parcel_id                  :uuid             not null
#  persona_id                 :uuid             not null
#  user_id                    :uuid             not null
#
# Indexes
#
#  index_training_sessions_on_id          (id) UNIQUE
#  index_training_sessions_on_parcel_id   (parcel_id)
#  index_training_sessions_on_persona_id  (persona_id)
#  index_training_sessions_on_user_id     (user_id)
#
# Foreign Keys
#
#  fk_rails_...  (parcel_id => parcels.id)
#  fk_rails_...  (persona_id => personas.id)
#  fk_rails_...  (user_id => users.id)
#
