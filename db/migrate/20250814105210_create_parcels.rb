class CreateParcels < ActiveRecord::Migration[8.0]
  def change
    create_table :parcels do |t|
      t.string :parcel_number
      t.string :location
      t.json :property_features

      t.timestamps
    end
  end
end
