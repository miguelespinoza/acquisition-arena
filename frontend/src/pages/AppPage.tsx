import { useAuth, useUser } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'
import { Phone } from 'lucide-react'

export default function AppPage() {
  const { signOut } = useAuth()
  const { user } = useUser()
  const navigate = useNavigate()

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
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
          >
            Logout
          </button>
        </div>


        {/* Call-to-Action */}
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center mb-8 mt-10">
          <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          
          <h3 className="text-4xl font-bold text-gray-900 mb-3">
            Ready to Start Training?
          </h3>
          
          <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
            Master the art of land acquisition through realistic AI-powered roleplay sessions. 
            Practice your negotiation skills with diverse seller personas and property scenarios.
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
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h4 className="text-base font-semibold text-gray-900 mb-1">Diverse Personas</h4>
            <p className="text-gray-600 text-xs">Practice with various seller personalities and negotiation styles</p>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h4 className="text-base font-semibold text-gray-900 mb-1">Real Properties</h4>
            <p className="text-gray-600 text-xs">Work with realistic property details and market scenarios</p>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h4 className="text-base font-semibold text-gray-900 mb-1">Performance Analytics</h4>
            <p className="text-gray-600 text-xs">Track your progress and improve your acquisition skills</p>
          </div>
        </div>
      </div>
    </div>
  )
}