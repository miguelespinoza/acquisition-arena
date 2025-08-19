import { useAuth, useUser } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'
import { Phone, User, MapPin, BarChart3, MessageSquare } from 'lucide-react'
import { useState } from 'react'
import useSWR from 'swr'
import { FeedbackModal } from '@/components/FeedbackModal'
import InviteCodeModal from '@/components/InviteCodeModal'
import { useApiClient, type UserProfile } from '@/lib/api'

interface HomeData {
  user: UserProfile
}

export default function AppPage() {
  const { signOut } = useAuth()
  const { user } = useUser()
  const navigate = useNavigate()
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false)
  const api = useApiClient()

  const { data: home, error, isLoading, mutate } = useSWR<HomeData>('/home', () => api.get<HomeData>('/home'))

  const handleLogout = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Failed to sign out:', error)
    }
  }

  const handleStartNewSession = () => {
    navigate('/create-session')
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
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
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
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">AA</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Land Acquisition Arena</h1>
              <p className="text-xs text-gray-600">
                Hello, {user?.firstName || user?.emailAddresses[0]?.emailAddress}! 
                {home && (
                  <span className="ml-2 text-green-600 font-medium">
                    {home.user.sessionsRemaining} sessions remaining
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsFeedbackModalOpen(true)}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors flex items-center space-x-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Submit Feedback</span>
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>


        {/* Call-to-Action */}
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center mb-8 mt-10">
          <h3 className="text-4xl font-bold text-gray-900 mb-3">
            Ready to Start Training?
          </h3>
          
          <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
            Perfect for beginner investors just getting started. Get those reps in and 
            build confidence through realistic AI-powered roleplay sessions.
          </p>
          
          <button
            onClick={handleStartNewSession}
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold text-lg rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            <Phone className="w-6 h-6 mr-2" fill="white" strokeWidth={0} />
            Start New Session
          </button>
        </div>

        {/* Features Preview */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <User className="w-5 h-5 text-purple-600" />
            </div>
            <h4 className="text-base font-semibold text-gray-900 mb-1">Diverse Personas</h4>
            <p className="text-gray-600 text-xs">Practice with various seller personalities and negotiation styles</p>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <MapPin className="w-5 h-5 text-green-600" />
            </div>
            <h4 className="text-base font-semibold text-gray-900 mb-1">Real Properties</h4>
            <p className="text-gray-600 text-xs">Work with realistic property details and market scenarios</p>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
            <h4 className="text-base font-semibold text-gray-900 mb-1">Performance Analytics</h4>
            <p className="text-gray-600 text-xs">Track your progress and improve your acquisition skills</p>
          </div>
        </div>
      </div>
      
      {/* Feedback Modal */}
      <FeedbackModal 
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
      />
    </div>
  )
}