import { useParams, useNavigate } from 'react-router-dom'
import useSWR from 'swr'
import { useApiClient } from '@/lib/api'
import type { TrainingSession } from '@/types'
import { useState, useEffect } from 'react'
import { getPersonaAvatar } from '@/utils/avatar'

export default function SessionPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const apiClient = useApiClient()
  const [isRinging, setIsRinging] = useState(true)
  const [callConnected, setCallConnected] = useState(false)

  // Fetch session details
  const { data: session, error, isLoading } = useSWR<TrainingSession>(
    id ? `/training_sessions/${id}` : null,
    () => apiClient.get<TrainingSession>(`/training_sessions/${id}`)
  )

  // Ring animation effect
  useEffect(() => {
    if (session) {
      const timer = setTimeout(() => {
        setIsRinging(false)
        setCallConnected(true)
      }, 3000) // Ring for 3 seconds, then "connect"

      return () => clearTimeout(timer)
    }
  }, [session])

  const handleEndSession = () => {
    navigate('/')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-lg text-gray-600">Loading training session...</div>
        </div>
      </div>
    )
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Session Not Found</h2>
            <p className="text-red-600 mb-4">The training session could not be loaded.</p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Return Home
            </button>
          </div>
        </div>
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
              <span className="text-white font-bold">AA</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Training Session</h1>
              <p className="text-sm text-gray-600">Session ID: {session.id}</p>
            </div>
          </div>
          <button
            onClick={handleEndSession}
            className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
          >
            End Session
          </button>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Call Interface */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
              {isRinging ? (
                <div className="space-y-6">
                  {/* Persona Avatar with pulse rings */}
                  <div className="flex justify-center relative">
                    {session.persona && (session.persona.avatarUrl || getPersonaAvatar(session.persona.id)) ? (
                      <img
                        src={session.persona.avatarUrl || getPersonaAvatar(session.persona.id)!}
                        alt={session.persona.name}
                        className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg relative z-10"
                      />
                    ) : (
                      <div className="w-32 h-32 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center border-4 border-white shadow-lg relative z-10">
                        <span className="text-white font-semibold text-3xl">
                          {session.persona?.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    {/* Pulse rings */}
                    <div className="absolute inset-0 w-32 h-32 mx-auto">
                      <div className="absolute inset-0 rounded-full border-4 border-green-300 animate-ping"></div>
                      <div className="absolute inset-2 rounded-full border-4 border-blue-300 animate-ping" style={{ animationDelay: '0.5s' }}></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-3xl font-bold text-gray-900">Ring Ring Ring! 📞</h2>
                    <p className="text-xl text-gray-600">Calling {session.persona?.name}...</p>
                    <p className="text-gray-500">Connecting to voice session</p>
                  </div>
                </div>
              ) : callConnected ? (
                <div className="space-y-6">
                  {/* Persona Avatar */}
                  <div className="flex justify-center">
                    {session.persona && (session.persona.avatarUrl || getPersonaAvatar(session.persona.id)) ? (
                      <img
                        src={session.persona.avatarUrl || getPersonaAvatar(session.persona.id)!}
                        alt={session.persona.name}
                        className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                      />
                    ) : (
                      <div className="w-32 h-32 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                        <span className="text-white font-semibold text-3xl">
                          {session.persona?.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-4">
                    <h2 className="text-3xl font-bold text-gray-900">Connected! 🎉</h2>
                    <p className="text-xl text-gray-600">You're now talking with {session.persona?.name}</p>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
                      <p className="text-yellow-800 font-medium">⚡ Voice Integration Coming Soon</p>
                      <p className="text-yellow-600 text-sm mt-1">
                        Voice conversation with AI personas will be available in the next update
                      </p>
                    </div>
                  </div>
                  
                  {/* Placeholder Controls */}
                  <div className="flex justify-center mt-8">
                    <button className="p-4 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {/* Session Info Sidebar */}
          <div className="space-y-6">
            {/* Persona Card */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Seller Persona
              </h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  {session.persona && (session.persona.avatarUrl || getPersonaAvatar(session.persona.id)) ? (
                    <img
                      src={session.persona.avatarUrl || getPersonaAvatar(session.persona.id)!}
                      alt={session.persona.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {session.persona?.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className="ml-3">
                    <h4 className="font-semibold text-gray-900">{session.persona?.name}</h4>
                    <p className="text-sm text-gray-600">Seller</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">{session.persona?.description}</p>
                {session.persona?.characteristics && typeof session.persona.characteristics === 'object' && (
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(session.persona.characteristics).slice(0, 4).map(([key, value]) => (
                      <span
                        key={key}
                        className="px-2 py-1 bg-purple-50 text-purple-600 text-xs rounded-full"
                      >
                        {String(value)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Parcel Card */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Property Details
              </h3>
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-gray-900">Parcel #{session.parcel?.parcelNumber}</h4>
                  <p className="text-sm text-gray-600 font-medium">{session.parcel?.location}</p>
                </div>
                {session.parcel?.propertyFeatures && typeof session.parcel.propertyFeatures === 'object' && (
                  <div className="space-y-2">
                    {Object.entries(session.parcel.propertyFeatures).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-gray-600 capitalize">{key.replace('_', ' ')}:</span>
                        <span className="text-gray-900 font-medium">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Session Status */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Session Info
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Status:</span>
                  <span className={`font-medium capitalize ${
                    session.status === 'active' ? 'text-green-600' : 
                    session.status === 'pending' ? 'text-yellow-600' : 
                    'text-gray-600'
                  }`}>
                    {session.status}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Started:</span>
                  <span className="text-gray-900 font-medium">
                    {new Date(session.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Duration:</span>
                  <span className="text-gray-900 font-medium">
                    {isRinging ? 'Connecting...' : callConnected ? 'In Progress' : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}