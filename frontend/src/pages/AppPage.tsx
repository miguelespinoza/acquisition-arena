import { useAuth, useUser } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'
import { Phone, User, MapPin, BarChart3, MessageSquare } from 'lucide-react'
import { useState } from 'react'
import { FeedbackModal } from '@/components/FeedbackModal'

export default function AppPage() {
  const { signOut } = useAuth()
  const { user } = useUser()
  const navigate = useNavigate()
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false)

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