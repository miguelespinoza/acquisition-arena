class CreatePersonas < ActiveRecord::Migration[8.0]
  def change
    create_table :personas do |t|
      t.string :name
      t.text :description
      t.string :avatar_url
      t.json :characteristics
      t.integer :characteristics_version

      t.timestamps
    end
  end
end
