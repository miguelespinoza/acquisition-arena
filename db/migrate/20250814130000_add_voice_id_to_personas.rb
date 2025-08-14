class AddVoiceIdToPersonas < ActiveRecord::Migration[8.0]
  def change
    add_column :personas, :voice_id, :string
  end
end