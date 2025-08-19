// Logger utility for development, PostHog, and Rollbar integration
import posthog from 'posthog-js'
import Rollbar from 'rollbar'
import { useEffect } from 'react'
import { useUser } from '@clerk/clerk-react'

// Initialize Rollbar
let rollbar: Rollbar | null = null

export const initializeRollbar = () => {
  if (typeof window !== 'undefined') {
    const accessToken = import.meta.env.VITE_ROLLBAR_ACCESS_TOKEN
    
    if (accessToken) {
      rollbar = new Rollbar({
        accessToken,
        environment: import.meta.env.MODE,
        captureUncaught: true,
        captureUnhandledRejections: true,
        payload: {
          client: {
            javascript: {
              code_version: '1.0.0',
              source_map_enabled: true,
            }
          }
        }
      })
    }
  }
}

export const initializePostHog = () => {
  if (typeof window !== 'undefined') {
    const key = import.meta.env.VITE_POSTHOG_KEY
    const host = import.meta.env.VITE_POSTHOG_HOST
    
    if (key && host) {
      posthog.init(key, {
        api_host: host,
        loaded: (posthog) => {
          if (import.meta.env.DEV) posthog.debug()
        },
        capture_pageview: false,
        capture_pageleave: true,
      })
    }
  }
}

// Initialize both services
export const initializeLogger = () => {
  initializeRollbar()
  initializePostHog()
}

export enum Events {
  // Authentication & Setup
  USER_SIGNED_UP = 'user_signed_up',
  USER_LOGGED_IN = 'user_logged_in',
  USER_LOGGED_OUT = 'user_logged_out',
  PERSONA_SELECTED = 'persona_selected',
  PARCEL_SELECTED = 'parcel_selected',
  TRAINING_SESSION_CREATED = 'training_session_created',
  
  // Voice Conversation
  MICROPHONE_CONFIGURED = 'microphone_configured',
  TRAINING_SESSION_STARTED = 'training_session_started',
  VOICE_CONNECTION_ESTABLISHED = 'voice_connection_established',
  AI_TOOL_END_CALL_TRIGGERED = 'ai_tool_end_call_triggered',
  TRAINING_SESSION_ENDED = 'training_session_ended',
  
  // Feedback & Business Metrics
  FEEDBACK_GENERATION_STARTED = 'feedback_generation_started',
  FEEDBACK_GENERATION_COMPLETED = 'feedback_generation_completed',
  FEEDBACK_GENERATION_FAILED = 'feedback_generation_failed',
  USER_FEEDBACK_SUBMITTED = 'user_feedback_submitted',
  TRAINING_SESSION_COMPLETED = 'training_session_completed'
}

export const track = (event: Events, properties: Record<string, unknown> = {}) => {
  // Always log to console in development
  if (import.meta.env.DEV) {
    if (Object.keys(properties).length > 0) {
      console.info(`[${new Date().toISOString()}] ${event}:`, properties)
    } else {
      console.info(`[${new Date().toISOString()}] ${event}`)
    }
  }

  // Track in PostHog (production and development)
  if (typeof window !== 'undefined') {
    posthog.capture(event, properties)
  }
}

export const captureError = (message: string, error?: Error, properties: Record<string, unknown> = {}) => {
  const errorData = {
    message,
    error: error ? {
      name: error.name,
      message: error.message,
      stack: error.stack,
    } : undefined,
    ...properties,
  }

  // Always log to console in development
  if (import.meta.env.DEV) {
    console.error(`[${new Date().toISOString()}] ERROR:`, errorData)
  }

  // Send to Rollbar if available
  if (rollbar) {
    if (error) {
      rollbar.error(error, properties)
    } else {
      rollbar.error(message, properties)
    }
  }

  // Track errors in PostHog
  if (typeof window !== 'undefined') {
    posthog.capture('$exception', errorData)
  }
}

export const debug = (message: string, properties: Record<string, unknown> = {}) => {
  if (import.meta.env.DEV) {
    console.debug(`[${new Date().toISOString()}] DEBUG: ${message}`, properties)
  }
}

// User Identification Hook for both PostHog and Rollbar
export const useLoggerUser = () => {
  const { user, isLoaded } = useUser()

  useEffect(() => {
    if (isLoaded && user) {
      const userData = {
        id: user.id,
        distinct_id: user.id,
        email: user.emailAddresses[0]?.emailAddress,
        first_name: user.firstName,
        last_name: user.lastName,
      }

      // Identify user in PostHog
      posthog.identify(user.id, userData)

      // Set user context in Rollbar
      if (rollbar) {
        rollbar.configure({
          payload: {
            person: {
              id: user.id,
              email: userData.email,
              username: userData.email,
            }
          }
        })
      }
    } else if (isLoaded && !user) {
      // Reset PostHog when user logs out
      posthog.reset()
      
      // Clear Rollbar user context
      if (rollbar) {
        rollbar.configure({
          payload: {
            person: undefined
          }
        })
      }
    }
  }, [user, isLoaded])

  return { user, isLoaded }
}