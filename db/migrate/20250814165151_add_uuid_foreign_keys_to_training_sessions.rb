class AddUuidForeignKeysToTrainingSessions < ActiveRecord::Migration[8.0]
  def change
    add_column :training_sessions, :user_uuid, :uuid
    add_column :training_sessions, :persona_uuid, :uuid
    add_column :training_sessions, :parcel_uuid, :uuid

    add_index :training_sessions, :user_uuid
    add_index :training_sessions, :persona_uuid
    add_index :training_sessions, :parcel_uuid
  end
end
