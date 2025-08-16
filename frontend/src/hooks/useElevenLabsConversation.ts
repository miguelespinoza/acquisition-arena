import { useConversation } from '@elevenlabs/react'
import { useState, useCallback, useRef } from 'react'
import { useApiClient } from '@/lib/api'

interface ElevenLabsSessionResponse {
  token: string
  conversation_id: string
  agent_id: string
}

interface ConversationMetrics {
  startTime: Date | null
  duration: number
  messageCount: number
  userSpeakingTime: number
  aiSpeakingTime: number
}

interface UseElevenLabsConversationProps {
  onConnect?: () => void
  onDisconnect?: () => void
  onError?: (error: any) => void
  onMessage?: (message: any) => void
}

export function useElevenLabsConversation({
  onConnect,
  onDisconnect,
  onError,
  onMessage
}: UseElevenLabsConversationProps = {}) {
  const apiClient = useApiClient()
  const [isConnecting, setIsConnecting] = useState(false)
  const [sessionData, setSessionData] = useState<ElevenLabsSessionResponse | null>(null)
  const [metrics, setMetrics] = useState<ConversationMetrics>({
    startTime: null,
    duration: 0,
    messageCount: 0,
    userSpeakingTime: 0,
    aiSpeakingTime: 0
  })
  
  const lastSpeakingChange = useRef<number>(Date.now())
  const intervalRef = useRef<NodeJS.Timeout>()

  // Initialize the base ElevenLabs conversation hook
  const conversation = useConversation({
    onConnect: () => {
      setMetrics(prev => ({ ...prev, startTime: new Date() }))
      setIsConnecting(false)
      
      // Start tracking session duration
      intervalRef.current = setInterval(() => {
        setMetrics(prev => ({
          ...prev,
          duration: prev.startTime ? Date.now() - prev.startTime.getTime() : 0
        }))
      }, 1000)
      
      onConnect?.()
    },
    
    onDisconnect: () => {
      setIsConnecting(false)
      
      // Clear duration tracking
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      
      onDisconnect?.()
    },
    
    onError: (error) => {
      setIsConnecting(false)
      onError?.(error)
    },
    
    onMessage: (message) => {
      setMetrics(prev => ({ ...prev, messageCount: prev.messageCount + 1 }))
      onMessage?.(message)
    },
    
    onModeChange: (mode) => {
      // Track speaking time
      const now = Date.now()
      const elapsed = now - lastSpeakingChange.current
      
      setMetrics(prev => {
        if (mode.mode === 'speaking') {
          return {
            ...prev,
            userSpeakingTime: prev.userSpeakingTime + elapsed
          }
        } else {
          return {
            ...prev,
            aiSpeakingTime: prev.aiSpeakingTime + elapsed
          }
        }
      })
      
      lastSpeakingChange.current = now
    }
  })

  const startConversation = useCallback(async (trainingSessionId: string) => {
    if (isConnecting || conversation.status === 'connected') {
      return
    }

    setIsConnecting(true)
    
    try {
      // Request microphone permission first
      await navigator.mediaDevices.getUserMedia({ audio: true })
      
      // Get ElevenLabs session token from backend
      const sessionResponse = await apiClient.post<ElevenLabsSessionResponse>(
        '/elevenlabs/session_token',
        { training_session_id: trainingSessionId }
      )
      
      setSessionData(sessionResponse)
      
      // Start ElevenLabs conversation with the token
      await conversation.startSession({
        agentId: sessionResponse.agent_id,
        conversationToken: sessionResponse.token,
        connectionType: 'webrtc' // Use WebRTC for lowest latency
      })
      
    } catch (error: any) {
      setIsConnecting(false)
      
      // Handle specific error types
      if (error.name === 'NotAllowedError') {
        onError?.(new Error('Microphone access is required for voice training sessions'))
      } else if (error.response?.status === 422) {
        onError?.(new Error('This training session cannot be started. Please try creating a new session.'))
      } else {
        onError?.(new Error('Failed to start voice conversation. Please try again.'))
      }
    }
  }, [conversation, apiClient, isConnecting, onError])

  const endConversation = useCallback(async () => {
    if (conversation.status === 'connected') {
      await conversation.endSession()
    }
    
    setSessionData(null)
    setMetrics({
      startTime: null,
      duration: 0,
      messageCount: 0,
      userSpeakingTime: 0,
      aiSpeakingTime: 0
    })
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
  }, [conversation])

  const setVolume = useCallback((volume: number) => {
    if (conversation.setVolume) {
      conversation.setVolume({ volume: Math.max(0, Math.min(1, volume)) })
    }
  }, [conversation])

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
  }, [])

  return {
    // Conversation controls
    startConversation,
    endConversation,
    setVolume,
    cleanup,
    
    // State
    status: conversation.status,
    isSpeaking: conversation.isSpeaking,
    isConnecting,
    sessionData,
    metrics,
    
    // Raw conversation object for advanced usage
    conversation
  }
}