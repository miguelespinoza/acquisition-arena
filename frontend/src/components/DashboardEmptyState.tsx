import { useNavigate } from 'react-router-dom'
import { Phone, User, MapPin, BarChart3 } from 'lucide-react'

interface DashboardEmptyStateProps {
  userName?: string
  sessionsRemaining?: number
}

export default function DashboardEmptyState({ userName, sessionsRemaining }: DashboardEmptyStateProps) {
  const navigate = useNavigate()

  const handleStartNewSession = () => {
    navigate('/create-session')
  }

  return (
    <>
      {/* Welcome Message */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {userName || 'User'}!</h1>
      </div>

      {/* Call-to-Action */}
      <div className="bg-white rounded-2xl shadow-xl p-16 text-center mb-8">
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
    </>
  )
}