import { useNavigate } from 'react-router-dom'
import { MapPin } from 'lucide-react'
import { getPersonaAvatar } from '../utils/avatar'
import { getGradeColor } from '../utils/gradeColor'
import type { TrainingSession } from '../types/training-session'

interface DashboardSessionCardProps {
  session: TrainingSession
}

export default function DashboardSessionCard({ session }: DashboardSessionCardProps) {
  const navigate = useNavigate()


  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return 'N/A'
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const avatarUrl = getPersonaAvatar(session.persona?.avatarUrl || null)

  return (
    <div 
      onClick={() => navigate(`/session/${session.id}`)}
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            {avatarUrl ? (
              <img 
                src={avatarUrl} 
                alt={session.persona?.name}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xl font-semibold">
                {session.persona?.name?.charAt(0) || '?'}
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {session.persona?.name || 'Unknown Persona'}
              </h3>
              <p className="text-sm text-gray-500">
                {session.persona?.description || 'No description'}
              </p>
            </div>
          </div>
          
          {session.feedbackGrade && (
            <div className={`px-4 py-2 rounded-full font-bold text-lg ${getGradeColor(session.feedbackGrade)}`}>
              {session.feedbackGrade}
            </div>
          )}
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <MapPin className="w-4 h-4 mr-1 text-green-600" />
              <span className="text-sm font-medium text-gray-600">Property</span>
            </div>
            <span className="text-sm text-gray-900">
              {session.parcel?.parcelNumber || 'N/A'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600 ml-5">Location</span>
            <span className="text-sm text-gray-900">
              {session.parcel ? `${session.parcel.city}, ${session.parcel.state}` : 'N/A'}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <span className="text-gray-500">
              Duration: <span className="font-medium text-gray-900">{formatDuration(session.sessionDurationInSeconds)}</span>
            </span>
            {session.feedbackScore && (
              <span className="text-gray-500">
                Score: <span className="font-medium text-gray-900">{session.feedbackScore}%</span>
              </span>
            )}
          </div>
          <span className="text-gray-400">
            {formatDate(session.createdAt)}
          </span>
        </div>
      </div>
    </div>
  )
}