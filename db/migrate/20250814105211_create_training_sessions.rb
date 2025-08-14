class CreateTrainingSessions < ActiveRecord::Migration[8.0]
  def change
    create_table :training_sessions do |t|
      t.references :user, null: false, foreign_key: true
      t.references :persona, null: false, foreign_key: true
      t.references :parcel, null: false, foreign_key: true
      t.text :conversation_transcript
      t.string :audio_url
      t.integer :grade_stars
      t.text :feedback_markdown
      t.integer :session_duration
      t.string :elevenlabs_session_token
      t.string :status

      t.timestamps
    end
  end
end
