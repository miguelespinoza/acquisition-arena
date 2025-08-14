class User < ApplicationRecord
  has_many :training_sessions, dependent: :destroy
  
  validates :clerk_user_id, presence: true, uniqueness: true
  validates :sessions_remaining, presence: true, numericality: { greater_than_or_equal_to: 0 }
  
  before_validation :set_defaults
  
  private
  
  def set_defaults
    self.sessions_remaining ||= 5
    self.invite_code_redeemed ||= false
  end
end
