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
