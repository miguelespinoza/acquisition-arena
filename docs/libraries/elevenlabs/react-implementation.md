# ElevenLabs React SDK Implementation

## Installation

```bash
npm install @elevenlabs/react
# or
yarn add @elevenlabs/react
# or 
pnpm install @elevenlabs/react
```

## Environment Setup

Add to your frontend `.env` file:
```bash
# ElevenLabs Configuration
VITE_ELEVENLABS_AGENT_ID=your_agent_id_here
```

## Core Hook: useConversation

The `useConversation` hook is the primary interface for managing conversational AI sessions.

### Basic Usage

```typescript
'use client';

import { useConversation } from '@elevenlabs/react';
import { useCallback } from 'react';

export function TrainingSession() {
  const conversation = useConversation({
    onConnect: () => console.log('Connected to training session'),
    onDisconnect: () => console.log('Training session ended'),
    onMessage: (message) => console.log('Message:', message),
    onError: (error) => console.error('Session error:', error),
  });

  const startTraining = useCallback(async () => {
    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Start the conversation session
      await conversation.startSession({
        agentId: import.meta.env.VITE_ELEVENLABS_AGENT_ID,
        user_id: 'user-123', // Your Clerk user ID
        connectionType: 'webrtc' // or 'websocket'
      });
    } catch (error) {
      console.error('Failed to start training session:', error);
    }
  }, [conversation]);

  const endTraining = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  return (
    <div className="training-interface">
      <div className="session-controls">
        <button onClick={startTraining}>
          Start Training Session
        </button>
        <button onClick={endTraining}>
          End Session
        </button>
      </div>
      
      <div className="session-status">
        <p>Status: {conversation.status}</p>
        <p>AI is {conversation.isSpeaking ? 'speaking' : 'listening'}</p>
      </div>
    </div>
  );
}
```

## Hook Configuration Options

### Event Handlers

```typescript
const conversation = useConversation({
  // Connection lifecycle
  onConnect: () => {
    console.log('Successfully connected to AI agent');
    // Update UI state, start timers, etc.
  },
  
  onDisconnect: () => {
    console.log('Disconnected from AI agent');
    // Save session data, show summary, etc.
  },
  
  // Message handling
  onMessage: (message) => {
    // Handle transcriptions and AI responses
    console.log('Message received:', message);
  },
  
  // Error handling
  onError: (error) => {
    console.error('Conversation error:', error);
    // Show user-friendly error messages
  },
  
  // Mode changes (speaking/listening)
  onModeChange: (mode) => {
    console.log('Mode changed to:', mode);
    // Update UI animations based on speaking state
  },
  
  // Status changes (connecting, connected, disconnected)
  onStatusChange: (status) => {
    console.log('Status changed to:', status);
    // Update connection indicators
  }
});
```

## Session Management

### Starting a Session

```typescript
await conversation.startSession({
  agentId: 'your-agent-id',
  user_id: 'clerk-user-id',
  connectionType: 'webrtc', // Recommended for lowest latency
  
  // Optional: Custom configuration
  overrides: {
    agent: {
      prompt: {
        prompt: "You are playing the role of a land seller. Your property is..."
      }
    }
  }
});
```

### Connection Types

- **WebRTC** (Recommended): Lowest latency, peer-to-peer connection
- **WebSocket**: More compatible but slightly higher latency

### Session Status Tracking

```typescript
// Available status values:
// - 'disconnected': Not connected
// - 'connecting': Attempting to connect
// - 'connected': Successfully connected and ready

const { status, isSpeaking } = conversation;

// Use for UI state management
const isSessionActive = status === 'connected';
const showLoadingSpinner = status === 'connecting';
```

## Volume Control

```typescript
// Set output volume (0.0 to 1.0)
conversation.setVolume({ volume: 0.8 });

// Get current volume levels (for visualization)
const inputVolume = conversation.getInputVolume?.();
const outputVolume = conversation.getOutputVolume?.();
```

## Phone Interface Component

Here's a complete example for your phone-like training interface:

```typescript
import { useConversation } from '@elevenlabs/react';
import { useState, useCallback, useEffect } from 'react';
import { WaveformVisualizer } from './WaveformVisualizer';

interface TrainingPhoneInterfaceProps {
  personaId: string;
  userId: string;
  onSessionEnd?: (sessionData: any) => void;
}

export function TrainingPhoneInterface({ 
  personaId, 
  userId, 
  onSessionEnd 
}: TrainingPhoneInterfaceProps) {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const conversation = useConversation({
    onConnect: () => {
      console.log('Training session connected');
      setIsSessionActive(true);
      setSessionStartTime(new Date());
      setError(null);
    },
    
    onDisconnect: () => {
      console.log('Training session ended');
      setIsSessionActive(false);
      
      if (sessionStartTime) {
        const sessionData = {
          personaId,
          userId,
          startTime: sessionStartTime,
          endTime: new Date(),
          duration: Date.now() - sessionStartTime.getTime()
        };
        onSessionEnd?.(sessionData);
      }
    },
    
    onError: (error) => {
      console.error('Session error:', error);
      setError('Session error occurred. Please try again.');
      setIsSessionActive(false);
    },
    
    onMessage: (message) => {
      // Handle transcriptions for session logging
      console.log('Message:', message);
    }
  });

  const startSession = useCallback(async () => {
    try {
      setError(null);
      
      // Request microphone permission first
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Start the conversation with the persona
      await conversation.startSession({
        agentId: import.meta.env.VITE_ELEVENLABS_AGENT_ID,
        user_id: userId,
        connectionType: 'webrtc',
        overrides: {
          agent: {
            prompt: {
              prompt: `You are role-playing as a land seller with persona ID ${personaId}. Respond naturally to acquisition calls and present realistic objections based on the persona characteristics.`
            }
          }
        }
      });
    } catch (err) {
      console.error('Failed to start session:', err);
      setError('Failed to start training session. Please check your microphone permissions.');
    }
  }, [conversation, personaId, userId]);

  // Prevent accidental session termination
  const confirmEndSession = useCallback(() => {
    if (window.confirm('Are you sure you want to end this training session?')) {
      conversation.endSession();
    }
  }, [conversation]);

  return (
    <div className="training-phone-interface">
      {/* Header */}
      <div className="phone-header">
        <h2>Training Session</h2>
        <div className="connection-status">
          <div className={`status-indicator ${conversation.status}`}>
            <span>{conversation.status}</span>
          </div>
        </div>
      </div>

      {/* Avatar & Waveform Area */}
      <div className="avatar-section">
        <div className="avatar-container">
          <div className="seller-avatar">
            <img src="/seller-avatar.png" alt="Seller" />
          </div>
          
          {/* Waveform Animation */}
          {isSessionActive && (
            <WaveformVisualizer 
              conversation={conversation}
              isActive={conversation.isSpeaking}
            />
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      {/* Session Info */}
      <div className="session-info">
        {sessionStartTime && (
          <p>Session started: {sessionStartTime.toLocaleTimeString()}</p>
        )}
        <p>AI is {conversation.isSpeaking ? 'speaking' : 'listening'}</p>
      </div>

      {/* Controls - Minimal like a phone */}
      <div className="phone-controls">
        {!isSessionActive ? (
          <button 
            className="start-call-btn"
            onClick={startSession}
            disabled={conversation.status === 'connecting'}
          >
            {conversation.status === 'connecting' ? 'Connecting...' : 'Start Call'}
          </button>
        ) : (
          <div className="active-call-controls">
            {/* Volume control */}
            <div className="volume-control">
              <label>Volume:</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                defaultValue="0.8"
                onChange={(e) => 
                  conversation.setVolume({ volume: parseFloat(e.target.value) })
                }
              />
            </div>
            
            {/* Emergency end button (hidden by default) */}
            <button 
              className="end-call-btn emergency"
              onClick={confirmEndSession}
              style={{ display: 'none' }} // Hide to prevent accidental clicks
            >
              End Call
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
```

## Error Handling

### Common Error Scenarios

```typescript
const handleSessionError = (error: any) => {
  switch (error.type) {
    case 'microphone_permission_denied':
      setError('Microphone access is required for training sessions');
      break;
    case 'network_error':
      setError('Network connection lost. Please try again.');
      break;
    case 'agent_not_found':
      setError('Training persona not found. Please contact support.');
      break;
    default:
      setError('An unexpected error occurred. Please try again.');
  }
};
```

### Microphone Permission Handling

```typescript
const checkMicrophonePermission = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach(track => track.stop()); // Clean up
    return true;
  } catch (error) {
    if (error.name === 'NotAllowedError') {
      // User denied microphone permission
      alert('Microphone access is required for training sessions. Please allow microphone access and try again.');
    }
    return false;
  }
};
```

## Integration with Existing App

### With Clerk Authentication

```typescript
import { useUser } from '@clerk/clerk-react';

export function TrainingComponent() {
  const { user } = useUser();
  
  // Use Clerk user ID for session tracking
  const userId = user?.id;
  
  return (
    <TrainingPhoneInterface 
      personaId="seller-001"
      userId={userId!}
      onSessionEnd={(sessionData) => {
        // Save session to your Rails API
        fetch('/api/training_sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sessionData)
        });
      }}
    />
  );
}
```

### With Rails API Integration

```typescript
const saveTrainingSession = async (sessionData: any) => {
  try {
    const response = await fetch('/api/training_sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${await getToken()}` // Clerk token
      },
      body: JSON.stringify({
        training_session: {
          user_id: sessionData.userId,
          persona_id: sessionData.personaId,
          started_at: sessionData.startTime,
          ended_at: sessionData.endTime,
          duration_seconds: Math.floor(sessionData.duration / 1000),
          status: 'completed'
        }
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to save session');
    }
    
    const result = await response.json();
    console.log('Session saved:', result);
  } catch (error) {
    console.error('Failed to save training session:', error);
  }
};
```

## Best Practices

### 1. Session Management
- Always request microphone permission before starting
- Implement confirmation dialogs for session termination
- Save session data immediately on disconnect
- Handle network interruptions gracefully

### 2. User Experience
- Show clear connection status indicators
- Provide visual feedback for speaking/listening states
- Implement volume controls for accessibility
- Use loading states during connection

### 3. Performance
- Use WebRTC connection type for lowest latency
- Implement proper cleanup on component unmount
- Monitor session duration for usage tracking
- Cache agent configurations when possible

### 4. Error Handling
- Provide user-friendly error messages
- Implement retry logic for network errors
- Log errors for debugging and monitoring
- Handle edge cases like page refresh during session

## Next Steps

- [Audio Visualization](./audio-visualization.md) - Implement waveform animations
- [Training Sessions](./training-sessions.md) - Advanced session management
- [API Integration](../../../app/controllers/api/elevenlabs_controller.rb) - Backend integration examples