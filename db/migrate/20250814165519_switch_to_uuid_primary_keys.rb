class SwitchToUuidPrimaryKeys < ActiveRecord::Migration[8.0]
  def up
    # Remove existing foreign key constraints
    remove_foreign_key :training_sessions, :users
    remove_foreign_key :training_sessions, :personas
    remove_foreign_key :training_sessions, :parcels

    # Remove old integer foreign key columns from training_sessions
    remove_column :training_sessions, :user_id
    remove_column :training_sessions, :persona_id
    remove_column :training_sessions, :parcel_id

    # Rename UUID foreign key columns to the standard names
    rename_column :training_sessions, :user_uuid, :user_id
    rename_column :training_sessions, :persona_uuid, :persona_id
    rename_column :training_sessions, :parcel_uuid, :parcel_id

    # Drop old integer primary key columns and rename UUID columns
    %w[users personas parcels training_sessions].each do |table|
      remove_column table.to_sym, :id
      rename_column table.to_sym, :uuid, :id
      execute "ALTER TABLE #{table} ADD PRIMARY KEY (id);"
    end

    # Add foreign key constraints with UUID references
    add_foreign_key :training_sessions, :users, column: :user_id, primary_key: :id
    add_foreign_key :training_sessions, :personas, column: :persona_id, primary_key: :id
    add_foreign_key :training_sessions, :parcels, column: :parcel_id, primary_key: :id
  end

  def down
    # This is a complex rollback - would need to recreate integer IDs
    raise ActiveRecord::IrreversibleMigration, "This migration cannot be reversed safely"
  end
end
