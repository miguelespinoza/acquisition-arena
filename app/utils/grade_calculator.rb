# frozen_string_literal: true

module GradeCalculator
  # Calculate grade letter based on numerical score
  # @param score [Integer, nil] The numerical score (0-100)
  # @return [String, nil] The grade letter ('A+', 'A', 'B+', etc.) or nil if score is nil
  def self.calculate_grade(score)
    return nil unless score

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
end