class CreateUsers < ActiveRecord::Migration[8.0]
  def change
    create_table :users do |t|
      t.string :clerk_user_id
      t.integer :sessions_remaining
      t.string :invite_code
      t.boolean :invite_code_redeemed

      t.timestamps
    end
  end
end
