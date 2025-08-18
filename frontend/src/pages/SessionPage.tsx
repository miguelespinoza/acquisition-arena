import { useParams, useNavigate } from 'react-router-dom'
import useSWR from 'swr'
import { useApiClient } from '@/lib/api'
import type { TrainingSession } from '@/types'
import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { getPersonaAvatar } from '@/utils/avatar'
import { useElevenLabsConversation } from '@/hooks/useElevenLabsConversation'
import { WaveformVisualizer } from '@/components/WaveformVisualizer'
import { MicrophoneSelector } from '@/components/MicrophoneSelector'
import { Settings, User, MapPin, BarChart3, X, PhoneOff, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SessionPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const apiClient = useApiClient()
  const [voiceError, setVoiceError] = useState<string | null>(null)
  const [volume, setVolume] = useState(0.8)
  const [selectedMicrophoneId, setSelectedMicrophoneId] = useState<string>('')
  const [microphoneConfigured, setMicrophoneConfigured] = useState(false)
  const hasAttemptedConnection = useRef(false)

  // Fetch session details
  const { data: session, error, isLoading } = useSWR<TrainingSession>(
    id ? `/training_sessions/${id}` : null,
    () => apiClient.get<TrainingSession>(`/training_sessions/${id}`)
  )

  // Memoize persona avatar URL
  const personaAvatarUrl = useMemo(() => {
    if (session?.persona?.avatarUrl) {
      return getPersonaAvatar(session.persona.avatarUrl, "../")
    }
    return null
  }, [session?.persona?.avatarUrl])

  // ElevenLabs conversation hook
  const {
    startConversation,
    endConversation,
    setVolume: setConversationVolume,
    status: conversationStatus,
    isSpeaking,
    isConnecting,
    metrics,
    cleanup
  } = useElevenLabsConversation({
    onConnect: () => {
      console.log('Voice conversation connected')
      setVoiceError(null)
      toast.success('Connected! Start speaking to begin the conversation.')
    },
    onDisconnect: () => {
      console.log('Voice conversation ended')
      toast.success('Training session completed!')
    },
    onError: (error) => {
      console.error('Voice conversation error:', error)
      setVoiceError(error.message)
      toast.error(error.message)
    }
  })

  // Auto-start conversation when session is loaded, pending, and microphone is configured
  useEffect(() => {
    if (session && session.status === 'pending' && id && conversationStatus === 'disconnected' && !hasAttemptedConnection.current && microphoneConfigured) {
      hasAttemptedConnection.current = true
      // Small delay to let UI render
      const timer = setTimeout(() => {
        startConversation(id)
      }, 1000)
      return () => {
        clearTimeout(timer)
      }
    }
  }, [session, id, conversationStatus, startConversation, microphoneConfigured])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup()
    }
  }, [cleanup])

  const handleEndSession = useCallback(async () => {
    if (conversationStatus === 'connected') {
      const confirmed = window.confirm(
        'Are you sure you want to end this training session? Your progress will be saved.'
      )
      if (!confirmed) return
      
      await endConversation()
    }
    navigate('/')
  }, [conversationStatus, endConversation, navigate])

  const handleVolumeChange = useCallback((newVolume: number) => {
    setVolume(newVolume)
    setConversationVolume(newVolume)
  }, [setConversationVolume])

  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const getStatusDisplay = () => {
    if (conversationStatus === 'connecting' || isConnecting) {
      return 'Connecting...'
    }
    if (conversationStatus === 'connected') {
      return isSpeaking ? 'AI Speaking' : 'Listening'
    }
    if (conversationStatus === 'disconnected' && session?.status === 'pending') {
      return 'Starting...'
    }
    return 'Waiting'
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
              {!microphoneConfigured && session?.status === 'pending' ? (
                <MicrophoneSelector
                  onMicrophoneSelected={setSelectedMicrophoneId}
                  onContinue={() => setMicrophoneConfigured(true)}
                />
              ) : !hasAttemptedConnection.current && session?.status === 'pending' && microphoneConfigured ? (
                <div className="space-y-6">
                  <div className="flex justify-center">
                    <div className="w-32 h-32 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                      <Settings className="w-16 h-16 text-white animate-spin" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-3xl font-bold text-gray-900">🎯 Preparing Session</h2>
                    <p className="text-xl text-gray-600">Setting up voice conversation with {session.persona?.name}...</p>
                    <p className="text-gray-500">Microphone configured, connecting...</p>
                  </div>
                </div>
              ) : conversationStatus === 'connecting' || isConnecting ? (
                <div className="space-y-6">
                  {/* Persona Avatar with pulse rings */}
                  <div className="flex justify-center relative">
                    {personaAvatarUrl ? (
                      <img
                        src={personaAvatarUrl}
                        alt={session.persona?.name}
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
                    <h2 className="text-3xl font-bold text-gray-900">📞 Connecting...</h2>
                    <p className="text-xl text-gray-600">Calling {session.persona?.name}...</p>
                    <p className="text-gray-500">Setting up voice conversation</p>
                  </div>
                </div>
              ) : conversationStatus === 'connected' ? (
                <div className="space-y-6">
                  {/* Persona Avatar with speaking indicator */}
                  <div className="flex justify-center relative">
                    {personaAvatarUrl ? (
                      <img
                        src={personaAvatarUrl}
                        alt={session.persona?.name}
                        className={`w-32 h-32 rounded-full object-cover border-4 shadow-lg transition-all duration-300 ${
                          isSpeaking ? 'border-green-400 scale-105' : 'border-white'
                        }`}
                      />
                    ) : (
                      <div className={`w-32 h-32 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center border-4 shadow-lg transition-all duration-300 ${
                        isSpeaking ? 'border-green-400 scale-105' : 'border-white'
                      }`}>
                        <span className="text-white font-semibold text-3xl">
                          {session.persona?.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    {/* Speaking indicator */}
                    {isSpeaking && (
                      <div className="absolute inset-0 w-32 h-32 mx-auto">
                        <div className="absolute inset-0 rounded-full border-4 border-green-400 animate-pulse"></div>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <h2 className="text-3xl font-bold text-gray-900">🎉 Live Conversation</h2>
                    <p className="text-xl text-gray-600">Speaking with {session.persona?.name}</p>
                    <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                      isSpeaking ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {isSpeaking ? '🗣️ AI Speaking' : '👂 Listening'}
                    </div>
                    
                    {/* Waveform Visualizer */}
                    <div className="my-4">
                      <WaveformVisualizer 
                        isActive={isSpeaking} 
                        height={50} 
                        barCount={8}
                        color={isSpeaking ? '#10B981' : '#6B7280'}
                        className="mb-2"
                      />
                    </div>
                    
                    {/* Session Metrics */}
                    {metrics.startTime && (
                      <div className="text-sm text-gray-600">
                        Duration: {formatDuration(metrics.duration)} | Messages: {metrics.messageCount}
                      </div>
                    )}
                  </div>
                  
                  {/* Volume Control */}
                  <div className="max-w-xs mx-auto">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Volume: {Math.round(volume * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={volume}
                      onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  
                  {/* End Call Button */}
                  <div className="flex justify-center mt-8">
                    <button 
                      onClick={handleEndSession}
                      className="p-4 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors group"
                      title="End training session"
                    >
                      <PhoneOff className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              ) : voiceError ? (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-32 h-32 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <AlertCircle className="w-16 h-16 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Connection Error</h2>
                    <p className="text-gray-600 mb-4">{voiceError}</p>
                    <button
                      onClick={() => {
                        if (id) {
                          hasAttemptedConnection.current = false
                          setVoiceError(null)
                          setMicrophoneConfigured(false) // Go back to mic selection
                        }
                      }}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <X className="w-16 h-16 text-gray-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Session Ended</h2>
                    <p className="text-gray-600">Training session has been completed.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Session Info Sidebar */}
          <div className="space-y-6">
            {/* Persona Card */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-purple-600" />
                Seller Persona
              </h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  {personaAvatarUrl ? (
                    <img
                      src={personaAvatarUrl}
                      alt={session.persona?.name}
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
                <MapPin className="w-5 h-5 mr-2 text-green-600" />
                Property Details
              </h3>
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-gray-900">Parcel #{session.parcel?.parcelNumber}</h4>
                  <p className="text-sm text-gray-600 font-medium">{session.parcel?.city}, {session.parcel?.state}</p>
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
                <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
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
                    {metrics.startTime ? formatDuration(metrics.duration) : getStatusDisplay()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Voice Status:</span>
                  <span className={`font-medium capitalize ${
                    conversationStatus === 'connected' ? 'text-green-600' : 
                    conversationStatus === 'connecting' ? 'text-yellow-600' : 
                    'text-gray-600'
                  }`}>
                    {getStatusDisplay()}
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