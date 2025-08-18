# frozen_string_literal: true

class TrainingSessionBlueprint < Blueprinter::Base
  identifier :id

  fields :status, :session_duration, :conversation_transcript, :audio_url, :elevenlabs_session_token, 
         :feedback_score, :feedback_text, :feedback_generated_at, :created_at, :updated_at

  field :feedback_grade do |session|
    next nil unless session.feedback_score
    
    score = session.feedback_score
    case score
    when 97..100 then 'A+'
    when 93..96 then 'A'
    when 90..92 then 'A-'
    when 87..89 then 'B+'
    when 83..86 then 'B'
    when 80..82 then 'B-'
    when 77..79 then 'C+'
    when 73..76 then 'C'
    when 70..72 then 'C-'
    when 67..69 then 'D+'
    when 63..66 then 'D'
    when 60..62 then 'D-'
    else 'F'
    end
  end

  association :persona, blueprint: PersonaBlueprint
  association :parcel, blueprint: ParcelBlueprint
end