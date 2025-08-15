class PopulateUuidForeignKeys < ActiveRecord::Migration[8.0]
  def up
    # Populate UUID foreign keys in training_sessions based on existing integer foreign keys
    execute <<-SQL
      UPDATE training_sessions 
      SET user_uuid = users.uuid 
      FROM users 
      WHERE training_sessions.user_id = users.id;
    SQL

    execute <<-SQL
      UPDATE training_sessions 
      SET persona_uuid = personas.uuid 
      FROM personas 
      WHERE training_sessions.persona_id = personas.id;
    SQL

    execute <<-SQL
      UPDATE training_sessions 
      SET parcel_uuid = parcels.uuid 
      FROM parcels 
      WHERE training_sessions.parcel_id = parcels.id;
    SQL

    # Make the UUID foreign keys non-null after populating them
    change_column_null :training_sessions, :user_uuid, false
    change_column_null :training_sessions, :persona_uuid, false
    change_column_null :training_sessions, :parcel_uuid, false
  end

  def down
    # Make the UUID foreign keys nullable again
    change_column_null :training_sessions, :user_uuid, true
    change_column_null :training_sessions, :persona_uuid, true
    change_column_null :training_sessions, :parcel_uuid, true

    # Clear the UUID foreign keys
    execute "UPDATE training_sessions SET user_uuid = NULL, persona_uuid = NULL, parcel_uuid = NULL;"
  end
end
