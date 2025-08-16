class AddCityAndStateToparcels < ActiveRecord::Migration[8.0]
  def change
    add_column :parcels, :city, :string
    add_column :parcels, :state, :string
    
    # Remove the old location column since we're splitting it into city/state
    remove_column :parcels, :location, :string
  end
end
