import { useNavigate } from 'react-router-dom'
import { User, MapPin, BarChart3 } from 'lucide-react'

export default function MarketingPage() {
  const navigate = useNavigate()

  const handleStartNewSession = () => {
    navigate('/login')
  }

  const handleLogin = () => {
    navigate('/login')
  }

  const handleSignUp = () => {
    navigate('/signup')
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
                Master land deals through AI roleplay
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLogin}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              Login
            </button>
            <button
              onClick={handleSignUp}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Sign Up
            </button>
          </div>
        </div>

        {/* Call-to-Action */}
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center mb-8 mt-10">
          <h3 className="text-4xl font-bold text-gray-900 mb-3">
            Master Land Deals That Actually Close
          </h3>
          
          <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
            Stop losing deals to awkward phone calls. Practice with AI sellers until you can 
            confidently negotiate any land acquisition. Join hundreds of investors closing more deals.
          </p>
          
          <button
            onClick={handleStartNewSession}
            className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold text-lg rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            Start Free Training
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
    </div>
  )
}