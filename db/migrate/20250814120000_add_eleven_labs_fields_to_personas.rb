class AddElevenLabsFieldsToPersonas < ActiveRecord::Migration[8.0]
  def change
    add_column :personas, :elevenlabs_agent_id, :string
    add_column :personas, :conversation_prompt, :text
    add_column :personas, :voice_settings, :json
    add_column :personas, :agent_created_at, :datetime
    
    add_index :personas, :elevenlabs_agent_id, unique: true
  end
end