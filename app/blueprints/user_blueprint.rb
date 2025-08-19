# frozen_string_literal: true

class UserBlueprint < Blueprinter::Base
  identifier :id

  fields :clerk_user_id, :first_name, :last_name, 
         :sessions_remaining, :invite_code_redeemed, 
         :created_at, :updated_at
end