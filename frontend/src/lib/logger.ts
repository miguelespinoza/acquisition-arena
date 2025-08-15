// Logger utility for development and future PostHog integration
// TODO: Add PostHog integration when ready

export enum Events {
  // Events will be added here as needed
}

export const logEvent = (event: Events, properties: Record<string, unknown> = {}) => {
  // For now, just log to console in development
  if (import.meta.env.DEV) {
    if (Object.keys(properties).length > 0) {
      console.info(`[${new Date().toISOString()}] ${event}:`, properties)
    } else {
      console.info(`[${new Date().toISOString()}] ${event}`)
    }
    return
  }

  // TODO: Add PostHog integration here
  // posthog.capture(event, properties as PostHogEventProperties)
}

export const logError = (message: string, error?: Error, properties: Record<string, unknown> = {}) => {
  const errorData = {
    message,
    error: error ? {
      name: error.name,
      message: error.message,
      stack: error.stack,
    } : undefined,
    ...properties,
  }

  if (import.meta.env.DEV) {
    console.error(`[${new Date().toISOString()}] ERROR:`, errorData)
    return
  }

  // TODO: Add PostHog error tracking here
}

export const logDebug = (message: string, properties: Record<string, unknown> = {}) => {
  if (import.meta.env.DEV) {
    console.debug(`[${new Date().toISOString()}] DEBUG: ${message}`, properties)
  }
}