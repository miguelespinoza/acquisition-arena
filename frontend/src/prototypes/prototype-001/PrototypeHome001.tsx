import { useNavigate } from 'react-router-dom'
import useSWR from 'swr'
import { useApiClient } from '../../lib/api'
import TrainingSessionCard from './TrainingSessionCard'
import type { TrainingSession } from '../../types/training-session'
import type { UserProfile } from '../../lib/api'

interface HomeData {
  user: UserProfile
  training_sessions: TrainingSession[]
}

// Remove this once testing is complete
const mockSessions: TrainingSession[] = [
  {
    id: 1,
    userId: 1,
    personaId: 1,
    parcelId: 1,
    status: 'completed',
    conversationTranscript: 'Mock transcript...',
    sessionDuration: 245,
    audioUrl: null,
    elevenlabsSessionToken: null,
    feedbackScore: 92,
    feedbackText: 'Great job on building rapport and asking qualifying questions.',
    feedbackGrade: 'A',
    feedbackGeneratedAt: '2024-01-15T14:30:00Z',
    createdAt: '2024-01-15T14:00:00Z',
    updatedAt: '2024-01-15T14:30:00Z',
    persona: {
      id: 1,
      name: 'Sarah Thompson',
      description: 'Motivated seller, inherited property',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
      characteristics: { motivation: 'high', flexibility: 'medium' },
      characteristicsVersion: '1.0',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    parcel: {
      id: 1,
      parcelNumber: 'APN-2024-001',
      city: 'Phoenix',
      state: 'AZ',
      propertyFeatures: { acres: 5, zoning: 'residential' },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }
  },
  {
    id: 2,
    userId: 1,
    personaId: 2,
    parcelId: 2,
    status: 'completed',
    conversationTranscript: 'Mock transcript...',
    sessionDuration: 180,
    audioUrl: null,
    elevenlabsSessionToken: null,
    feedbackScore: 78,
    feedbackText: 'Good effort, but could improve on handling objections.',
    feedbackGrade: 'B+',
    feedbackGeneratedAt: '2024-01-14T16:45:00Z',
    createdAt: '2024-01-14T16:30:00Z',
    updatedAt: '2024-01-14T16:45:00Z',
    persona: {
      id: 2,
      name: 'Mike Johnson',
      description: 'Skeptical landowner, price-focused',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
      characteristics: { motivation: 'low', skepticism: 'high' },
      characteristicsVersion: '1.0',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    parcel: {
      id: 2,
      parcelNumber: 'APN-2024-002',
      city: 'Tucson',
      state: 'AZ',
      propertyFeatures: { acres: 10, zoning: 'agricultural' },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }
  },
  {
    id: 3,
    userId: 1,
    personaId: 3,
    parcelId: 3,
    status: 'completed',
    conversationTranscript: 'Mock transcript...',
    sessionDuration: 320,
    audioUrl: null,
    elevenlabsSessionToken: null,
    feedbackScore: 65,
    feedbackText: 'Needs improvement on closing techniques and urgency creation.',
    feedbackGrade: 'C+',
    feedbackGeneratedAt: '2024-01-13T10:20:00Z',
    createdAt: '2024-01-13T10:00:00Z',
    updatedAt: '2024-01-13T10:20:00Z',
    persona: {
      id: 3,
      name: 'Linda Davis',
      description: 'Indecisive seller, needs reassurance',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Linda',
      characteristics: { motivation: 'medium', indecisive: 'high' },
      characteristicsVersion: '1.0',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    parcel: {
      id: 3,
      parcelNumber: 'APN-2024-003',
      city: 'Flagstaff',
      state: 'AZ',
      propertyFeatures: { acres: 3, zoning: 'mixed-use' },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }
  },
  {
    id: 4,
    userId: 1,
    personaId: 4,
    parcelId: 4,
    status: 'completed',
    conversationTranscript: 'Mock transcript...',
    sessionDuration: 420,
    audioUrl: null,
    elevenlabsSessionToken: null,
    feedbackScore: 88,
    feedbackText: 'Excellent handling of technical questions and property details.',
    feedbackGrade: 'A',
    feedbackGeneratedAt: '2024-01-12T15:30:00Z',
    createdAt: '2024-01-12T15:00:00Z',
    updatedAt: '2024-01-12T15:30:00Z',
    persona: {
      id: 4,
      name: 'Robert Chen',
      description: 'Technical buyer, detail-oriented',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Robert',
      characteristics: { analytical: 'high', patience: 'low' },
      characteristicsVersion: '1.0',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    parcel: {
      id: 4,
      parcelNumber: 'APN-2024-004',
      city: 'Sedona',
      state: 'AZ',
      propertyFeatures: { acres: 7, zoning: 'commercial' },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }
  }
]

export default function PrototypeHome001() {
  const navigate = useNavigate()
  const api = useApiClient()
  
  // Fetch home data including completed sessions
  const { data: home, error, isLoading } = useSWR<HomeData>(
    '/home',
    () => api.get<HomeData>('/home')
  )
  
  // Use real sessions if available, otherwise fall back to mock data for development
  const sessions = home?.training_sessions || []

  const averageScore = sessions.length > 0
    ? Math.round(sessions.reduce((sum, s) => sum + (s.feedbackScore || 0), 0) / sessions.length)
    : 0

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Training Sessions</h1>
          <p className="mt-2 text-gray-600">Welcome back, {home?.user?.firstName || 'User'}!</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Total Sessions</div>
            <div className="text-3xl font-bold text-gray-900">{sessions.length}</div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Average Score</div>
            <div className="text-3xl font-bold text-indigo-600">{averageScore}%</div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Best Grade</div>
            <div className="text-3xl font-bold text-green-600">
              {sessions.find(s => s.feedbackGrade?.startsWith('A'))?.feedbackGrade || 'N/A'}
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Total Time</div>
            <div className="text-3xl font-bold text-gray-900">
              {Math.round(sessions.reduce((sum, s) => sum + (s.session_duration || s.sessionDuration || 0), 0) / 60)}m
            </div>
          </div>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Completed Sessions</h2>
          <button
            onClick={() => navigate('/create-session')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Start New Session
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-red-500 mb-4">Failed to load training sessions.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : sessions.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 mb-4">No completed training sessions yet.</p>
            <button
              onClick={() => navigate('/create-session')}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Start Your First Session
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {sessions.map((session) => (
              <TrainingSessionCard key={session.id} session={session} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}