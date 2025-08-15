class RemoveFeedbackFromTrainingSessions < ActiveRecord::Migration[8.0]
  def change
    remove_column :training_sessions, :grade_stars, :integer
    remove_column :training_sessions, :feedback_markdown, :text
  end
end