class AddUuidColumnsToAllTables < ActiveRecord::Migration[8.0]
  def change
    add_column :users, :uuid, :uuid, default: 'gen_random_uuid()', null: false
    add_column :personas, :uuid, :uuid, default: 'gen_random_uuid()', null: false
    add_column :parcels, :uuid, :uuid, default: 'gen_random_uuid()', null: false
    add_column :training_sessions, :uuid, :uuid, default: 'gen_random_uuid()', null: false

    add_index :users, :uuid, unique: true
    add_index :personas, :uuid, unique: true
    add_index :parcels, :uuid, unique: true
    add_index :training_sessions, :uuid, unique: true
  end
end
