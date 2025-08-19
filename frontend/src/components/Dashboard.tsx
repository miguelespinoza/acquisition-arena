import { useNavigate } from 'react-router-dom'
import DashboardSessionCard from './DashboardSessionCard'
import DashboardEmptyState from './DashboardEmptyState'
import { getGradeColor } from '../utils/gradeColor'
import type { TrainingSession } from '../types/training-session'

interface Statistics {
  total_sessions: number
  average_score: number
  best_grade: string | null
  total_duration_minutes: number
}

interface DashboardProps {
  trainingSessions: TrainingSession[]
  statistics: Statistics
  userName?: string
  sessionsRemaining?: number
}

export default function Dashboard({ trainingSessions, statistics, userName, sessionsRemaining }: DashboardProps) {
  const navigate = useNavigate()

  // Format total time as MM:SS with units
  const formatTotalTime = (minutes: number) => {
    const totalSeconds = minutes * 60
    const displayMinutes = Math.floor(totalSeconds / 60)
    const displaySeconds = Math.floor(totalSeconds % 60)
    return `${displayMinutes}m ${displaySeconds}s`
  }

  // If no training sessions, show the empty state
  if (trainingSessions.length === 0) {
    return (
      <div className="py-8">
        <DashboardEmptyState userName={userName} sessionsRemaining={sessionsRemaining} />
      </div>
    )
  }

  return (
    <div className="pt-0 pb-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {userName || 'User'}!</h1>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500 mb-1">Total Sessions</div>
          <div className="text-3xl font-bold text-gray-900">
            {statistics.total_sessions}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500 mb-1">Average Score</div>
          <div className="text-3xl font-bold text-indigo-600">
            {statistics.average_score}%
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500 mb-1">Best Grade</div>
          <div className="text-3xl font-bold">
            {statistics.best_grade ? (
              <span className={`font-bold ${getGradeColor(statistics.best_grade).split(' ')[1]}`}>
                {statistics.best_grade}
              </span>
            ) : (
              <span className="text-gray-400">N/A</span>
            )}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm font-medium text-gray-500 mb-1">Total Time</div>
          <div className="text-3xl font-bold text-gray-900">
            {formatTotalTime(statistics.total_duration_minutes)}
          </div>
        </div>
      </div>

      {/* Sessions Header */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Training Sessions</h2>
        <button
          onClick={() => navigate('/create-session')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer"
        >
          Start New Session
        </button>
      </div>

      {/* Sessions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {trainingSessions.map((session) => (
          <DashboardSessionCard key={session.id} session={session} />
        ))}
      </div>
    </div>
  )
}