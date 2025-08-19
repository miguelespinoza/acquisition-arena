import { useConversation } from '@elevenlabs/react'
import { useState, useCallback, useRef } from 'react'
import { useApiClient } from '@/lib/api'
import { track, Events, captureError } from '@/lib/logger'

interface ElevenLabsSessionResponse {
  token: string
  agent_id: string
  dynamic_variables: {
    land_parcel_sub_details: string
  }
}

interface ConversationMetrics {
  startTime: Date | null
  duration: number
  messageCount: number
  userSpeakingTime: number
  aiSpeakingTime: number
}

interface UseElevenLabsConversationProps {
  trainingSessionId?: string
  onConnect?: () => void
  onDisconnect?: () => void
  onError?: (error: Error) => void
  onMessage?: (message: unknown) => void
}

export function useElevenLabsConversation({
  trainingSessionId,
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
  const hasEndCallBeenTriggered = useRef(false)
  const endCallTimeoutRef = useRef<NodeJS.Timeout>()
  const conversationIdRef = useRef<string | null>(null)

  // Initialize the base ElevenLabs conversation hook
  const conversation = useConversation({
    onConnect: (props) => {
      // Store the conversation ID for later use
      conversationIdRef.current = props.conversationId
      
      track(Events.VOICE_CONNECTION_ESTABLISHED, {
        session_id: trainingSessionId,
        conversation_id: props.conversationId
      })
      
      setMetrics(prev => ({ ...prev, startTime: new Date() }))
      setIsConnecting(false)
      hasEndCallBeenTriggered.current = false // Reset flag on new connection
      
      // Start tracking session duration
      intervalRef.current = setInterval(() => {
        setMetrics(prev => ({
          ...prev,
          duration: prev.startTime ? Date.now() - prev.startTime.getTime() : 0
        }))
      }, 1000)
      
      onConnect?.()
    },
    
    onDebug: async (props) => {
      // Check if this is an end_call tool response
      if (props?.type === 'agent_tool_response' && 
          props?.agent_tool_response?.tool_name === 'end_call' &&
          !hasEndCallBeenTriggered.current) {
        
        track(Events.AI_TOOL_END_CALL_TRIGGERED, {
          session_id: trainingSessionId,
          conversation_id: conversationIdRef.current
        })
        
        hasEndCallBeenTriggered.current = true // Prevent multiple triggers
        
        // Clear any existing timeout
        if (endCallTimeoutRef.current) {
          clearTimeout(endCallTimeoutRef.current)
        }
        
        // Handle the end call with a delay to allow final audio to play
        endCallTimeoutRef.current = setTimeout(async () => {
          try {
            // First, notify the backend about conversation ending with the conversation ID
            if (trainingSessionId && conversationIdRef.current) {
              try {
                await apiClient.post(`/training_sessions/${trainingSessionId}/end_conversation`, {
                  elevenlabs_conversation_id: conversationIdRef.current
                })
              } catch (backendError) {
                console.error('Failed to notify backend:', backendError)
              }
            }
            
            // Try to end the session if still connected
            if (conversation.status === 'connected') {
              try {
                await conversation.endSession()
              } catch (endError) {
                console.error('Failed to end session:', endError)
              }
            }
            
            // Clear interval timer
            if (intervalRef.current) {
              clearInterval(intervalRef.current)
            }
            
            // Call the onDisconnect callback manually since it won't fire
            onDisconnect?.()
            
          } catch (error) {
            console.error('Error in end_call handler:', error)
            // Even on error, call the disconnect callback
            onDisconnect?.()
          }
        }, 2000) // 2 second delay to allow "goodbye" audio to finish
      }
    },
    
    onDisconnect: async () => {
      // Check if this was already handled by end_call
      if (hasEndCallBeenTriggered.current) {
        return
      }
      
      setIsConnecting(false)
      
      // Clear duration tracking
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      
      // Notify backend that conversation ended with the conversation ID
      if (trainingSessionId && conversationIdRef.current) {
        try {
          await apiClient.post(`/training_sessions/${trainingSessionId}/end_conversation`, {
            elevenlabs_conversation_id: conversationIdRef.current
          })
        } catch (error) {
          console.error('Failed to notify conversation ended:', error)
        }
      }
      
      onDisconnect?.()
    },
    
    onError: (message, context) => {
      captureError('ElevenLabs conversation error', new Error(message), {
        session_id: trainingSessionId,
        conversation_id: conversationIdRef.current,
        context
      })
      setIsConnecting(false)
      onError?.(new Error(message))
    },
    
    onMessage: (props) => {
      setMetrics(prev => ({ ...prev, messageCount: prev.messageCount + 1 }))
      onMessage?.(props)
    },
    
    onAudio: (base64Audio) => {
      // Audio received - no logging needed
    },
    
    onModeChange: (prop) => {
      // Track speaking time
      const now = Date.now()
      const elapsed = now - lastSpeakingChange.current
      
      setMetrics(prev => {
        if (prop.mode === 'speaking') {
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
    },
    
    onStatusChange: (prop) => {
      // Status changed - no logging needed
    },
    
    onCanSendFeedbackChange: (prop) => {
      // Feedback state changed - no logging needed
    },
    
    onUnhandledClientToolCall: (params) => {
      // Unhandled tool call - no logging needed
    },
    
    onVadScore: (props) => {
      // Voice activity detection - no logging needed
    }
  })

  const startConversation = useCallback(async () => {
    if (!trainingSessionId) {
      onError?.(new Error('No training session ID provided'))
      return
    }
    
    if (isConnecting || conversation.status === 'connected') {
      return
    }

    setIsConnecting(true)
    
    try {
      // Request microphone permission first
      await navigator.mediaDevices.getUserMedia({ audio: true })
      
      // Get ElevenLabs session token from backend
      const sessionResponse = await apiClient.post<ElevenLabsSessionResponse>(
        `/training_sessions/${trainingSessionId}/start_conversation`
      )
      
      track(Events.TRAINING_SESSION_STARTED, {
        session_id: trainingSessionId,
        agent_id: sessionResponse.agent_id
      })
      
      setSessionData(sessionResponse)
      
      // Start ElevenLabs conversation with the token and dynamic variables
      await conversation.startSession({
        agentId: sessionResponse.agent_id,
        conversationToken: sessionResponse.token,
        connectionType: 'webrtc', // Use WebRTC for lowest latency
        dynamicVariables: sessionResponse.dynamic_variables
      })
    } catch (error: unknown) {
      setIsConnecting(false)
      
      // Handle specific error types
      const errorObj = error as Error & { response?: { status: number } }
      if (errorObj.name === 'NotAllowedError') {
        captureError('Microphone permission denied', errorObj, {
          session_id: trainingSessionId
        })
        onError?.(new Error('Microphone access is required for voice training sessions'))
      } else if (errorObj.response?.status === 422) {
        captureError('Training session start failed - 422', errorObj, {
          session_id: trainingSessionId
        })
        onError?.(new Error('This training session cannot be started. Please try creating a new session.'))
      } else {
        captureError('Voice conversation start failed', errorObj, {
          session_id: trainingSessionId
        })
        onError?.(new Error('Failed to start voice conversation. Please try again.'))
      }
    }
  }, [conversation, apiClient, isConnecting, onError, trainingSessionId])

  const endConversation = useCallback(async () => {
    if (conversation.status === 'connected') {
      await conversation.endSession()
    }
    
    // Clear any pending end call timeout
    if (endCallTimeoutRef.current) {
      clearTimeout(endCallTimeoutRef.current)
    }
    
    setSessionData(null)
    hasEndCallBeenTriggered.current = false
    conversationIdRef.current = null
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
    if (endCallTimeoutRef.current) {
      clearTimeout(endCallTimeoutRef.current)
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