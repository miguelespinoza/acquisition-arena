class TrainingSession < ApplicationRecord
  belongs_to :user
  belongs_to :persona
  belongs_to :parcel
  
  validates :status, inclusion: { in: %w[pending active completed failed] }
  validates :grade_stars, numericality: { in: 1..5 }, allow_nil: true
  validates :session_duration, numericality: { greater_than: 0 }, allow_nil: true
  
  before_validation :set_defaults
  
  scope :completed, -> { where(status: 'completed') }
  scope :for_user, ->(user) { where(user: user) }
  
  def completed?
    status == 'completed'
  end
  
  def gradeable?
    completed? && conversation_transcript.present?
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
#  id                       :bigint           not null, primary key
#  audio_url                :string
#  conversation_transcript  :text
#  elevenlabs_session_token :string
#  feedback_markdown        :text
#  grade_stars              :integer
#  session_duration         :integer
#  status                   :string
#  created_at               :datetime         not null
#  updated_at               :datetime         not null
#  parcel_id                :bigint           not null
#  persona_id               :bigint           not null
#  user_id                  :bigint           not null
#
# Indexes
#
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
