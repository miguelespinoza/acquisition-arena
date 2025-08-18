class AddFeedbackFieldsToTrainingSessions < ActiveRecord::Migration[8.0]
  def change
    add_column :training_sessions, :elevenlabs_conversation_id, :string
    add_column :training_sessions, :feedback_score, :integer
    add_column :training_sessions, :feedback_text, :text
    add_column :training_sessions, :feedback_generated_at, :datetime
  end
end
