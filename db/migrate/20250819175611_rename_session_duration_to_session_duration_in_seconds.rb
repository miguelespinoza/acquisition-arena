class RenameSessionDurationToSessionDurationInSeconds < ActiveRecord::Migration[8.0]
  def change
    rename_column :training_sessions, :session_duration, :session_duration_in_seconds
  end
end
