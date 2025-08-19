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

# == Schema Information
#
# Table name: users
#
#  id                   :uuid             not null, primary key
#  email_address        :string
#  first_name           :string
#  invite_code          :string
#  invite_code_redeemed :boolean
#  last_name            :string
#  sessions_remaining   :integer
#  created_at           :datetime         not null
#  updated_at           :datetime         not null
#  clerk_user_id        :string
#
# Indexes
#
#  index_users_on_email_address  (email_address)
#  index_users_on_id             (id) UNIQUE
#
