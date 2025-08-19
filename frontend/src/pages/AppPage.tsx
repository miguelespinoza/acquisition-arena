import { useAuth, useUser } from '@clerk/clerk-react'
import { MessageSquare } from 'lucide-react'
import { useState } from 'react'
import useSWR from 'swr'
import { FeedbackModal } from '@/components/FeedbackModal'
import InviteCodeModal from '@/components/InviteCodeModal'
import Dashboard from '@/components/Dashboard'
import { useApiClient, type UserProfile, type TrainingSession } from '@/lib/api'
import { track, Events } from '@/lib/logger'

interface Statistics {
  total_sessions: number
  average_score: number
  best_grade: string | null
  total_duration_minutes: number
}

interface HomeData {
  user: UserProfile
  training_sessions: TrainingSession[]
  statistics: Statistics
}

export default function AppPage() {
  const { signOut } = useAuth()
  const { user } = useUser()
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false)
  const api = useApiClient()

  const { data: home, error, isLoading, mutate } = useSWR<HomeData>('/home', () => api.get<HomeData>('/home'))

  const handleLogout = async () => {
    try {
      await signOut()
      track(Events.USER_LOGGED_OUT)
    } catch (error) {
      console.error('Failed to sign out:', error)
    }
  }


  const handleInviteCodeSuccess = () => {
    mutate()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-2">Failed to load data</p>
          <button 
            onClick={() => mutate()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (home && !home.user.inviteCodeRedeemed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <InviteCodeModal onSuccess={handleInviteCodeSuccess} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">AA</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Land Acquisition Arena</h1>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsFeedbackModalOpen(true)}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors flex items-center space-x-2 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Submit Feedback</span>
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>


        {/* Dashboard Component */}
        <Dashboard 
          trainingSessions={home?.training_sessions || []}
          statistics={home?.statistics || {
            total_sessions: 0,
            average_score: 0,
            best_grade: null,
            total_duration_minutes: 0
          }}
          userName={home?.user?.firstName || user?.firstName || 'User'}
          sessionsRemaining={home?.user?.sessionsRemaining}
        />
      </div>
      
      {/* Feedback Modal */}
      <FeedbackModal 
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
      />
    </div>
  )
}