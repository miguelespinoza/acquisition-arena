class RemoveVoiceSettingsFromPersonas < ActiveRecord::Migration[8.0]
  def change
    remove_column :personas, :voice_settings, :json
  end
end
