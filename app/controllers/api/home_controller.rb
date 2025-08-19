require_relative '../../utils/grade_calculator'

class Api::HomeController < ApplicationController
  def index
    # Fetch completed training sessions with associations
    completed_sessions = current_user.training_sessions
      .where(status: 'completed')
      .includes(:persona, :parcel)
      .order(created_at: :desc)
    
    # Calculate statistics
    statistics = calculate_statistics(completed_sessions)
    
    render json: {
      user: UserBlueprint.render_as_hash(current_user),
      training_sessions: TrainingSessionBlueprint.render_as_hash(completed_sessions),
      statistics: statistics
    }
  end
  
  private
  
  def calculate_statistics(sessions)
    return default_statistics if sessions.empty?
    
    scores = sessions.filter_map(&:feedback_score)
    durations = sessions.filter_map(&:session_duration)
    
    {
      total_sessions: sessions.count,
      average_score: scores.any? ? (scores.sum.to_f / scores.count).round : 0,
      best_grade: find_best_grade(sessions),
      total_duration_minutes: durations.sum / 60
    }
  end
  
  def default_statistics
    {
      total_sessions: 0,
      average_score: 0,
      best_grade: nil,
      total_duration_minutes: 0
    }
  end
  
  def find_best_grade(sessions)
    # Grade hierarchy: A+ > A > A- > B+ > B > B- > C+ > C > C- > D+ > D > D- > F
    grade_order = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F']
    
    sessions_with_grades = sessions.filter_map do |session|
      GradeCalculator.calculate_grade(session.feedback_score)
    end
    
    # Find the best grade based on hierarchy
    grade_order.each do |grade|
      return grade if sessions_with_grades.include?(grade)
    end
    
    nil
  end
end