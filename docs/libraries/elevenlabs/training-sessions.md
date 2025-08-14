# Training Session Management with ElevenLabs

## Overview

This guide covers implementing training-specific features for the Acquisition Roleplay Trainer using ElevenLabs Conversational AI. It focuses on session management, persona configuration, feedback collection, and integration with your Rails backend.

## Session Architecture

### Data Models Integration

Based on your Rails models, here's how ElevenLabs integrates:

```ruby
# app/models/training_session.rb
class TrainingSession < ApplicationRecord
  belongs_to :user
  belongs_to :persona
  
  # ElevenLabs-specific fields
  # elevenlabs_session_id: string - ElevenLabs conversation ID
  # conversation_transcript: text - Full conversation log
  # audio_duration_seconds: integer - Total session duration
  # ai_feedback_score: float - Post-session AI evaluation
  # status: enum - pending, active, completed, failed
end

# app/models/persona.rb  
class Persona < ApplicationRecord
  has_many :training_sessions
  
  # ElevenLabs configuration
  # elevenlabs_agent_id: string - Agent ID for this persona
  # voice_settings: json - Voice customization options
  # conversation_prompt: text - Custom prompt for this seller type
end
```

## Session Configuration

### Dynamic Persona Setup

```typescript
interface PersonaConfig {
  id: string;
  name: string;
  property_type: string;
  location: string;
  motivation_level: 'low' | 'medium' | 'high';
  objection_patterns: string[];
  voice_id?: string;
  conversation_style: 'friendly' | 'skeptical' | 'aggressive' | 'cooperative';
}

export class TrainingSessionManager {
  private conversation: any;
  private sessionData: {
    id?: string;
    startTime: Date;
    endTime?: Date;
    transcript: string[];
    personaId: string;
    userId: string;
  };

  constructor(conversation: any, persona: PersonaConfig, userId: string) {
    this.conversation = conversation;
    this.sessionData = {
      startTime: new Date(),
      transcript: [],
      personaId: persona.id,
      userId: userId
    };
  }

  async startSession(persona: PersonaConfig): Promise<void> {
    // Generate dynamic prompt based on persona
    const prompt = this.generatePersonaPrompt(persona);
    
    try {
      await this.conversation.startSession({
        agentId: persona.elevenlabs_agent_id || process.env.VITE_ELEVENLABS_AGENT_ID,
        user_id: this.sessionData.userId,
        connectionType: 'webrtc',
        overrides: {
          agent: {
            prompt: { prompt },
            voice: persona.voice_id ? { voice_id: persona.voice_id } : undefined
          }
        }
      });
      
      // Save session start to backend
      await this.saveSessionStart();
    } catch (error) {
      console.error('Failed to start training session:', error);
      throw error;
    }
  }

  private generatePersonaPrompt(persona: PersonaConfig): string {
    const basePrompt = `You are role-playing as a land seller named ${persona.name}. `;
    
    const propertyDetails = `You own ${persona.property_type} property in ${persona.location}. `;
    
    const motivationContext = {
      low: "You're not in a hurry to sell and will be selective about offers. You may be skeptical of investors.",
      medium: "You're interested in selling but want to make sure you get a fair deal. You'll listen to reasonable offers.",
      high: "You're motivated to sell quickly due to financial pressure or life changes. You're open to negotiating."
    }[persona.motivation_level];
    
    const styleContext = {
      friendly: "You're warm and conversational, building rapport easily.",
      skeptical: "You're cautious and ask many questions before trusting anyone.",
      aggressive: "You're direct and may be confrontational if you don't like what you hear.",
      cooperative: "You're helpful and willing to work together to find a solution."
    }[persona.conversation_style];

    const objectionInstructions = persona.objection_patterns.length > 0 
      ? `Throughout the conversation, naturally bring up these concerns: ${persona.objection_patterns.join(', ')}. `
      : '';

    return basePrompt + propertyDetails + motivationContext + ' ' + styleContext + ' ' + 
           objectionInstructions + 
           `Remember to stay in character throughout the entire conversation. Respond naturally as a real property owner would.`;
  }

  private async saveSessionStart(): Promise<void> {
    try {
      const response = await fetch('/api/training_sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getClerkToken()}`
        },
        body: JSON.stringify({
          training_session: {
            user_id: this.sessionData.userId,
            persona_id: this.sessionData.personaId,
            started_at: this.sessionData.startTime.toISOString(),
            status: 'active'
          }
        })
      });

      if (response.ok) {
        const result = await response.json();
        this.sessionData.id = result.data.id;
      }
    } catch (error) {
      console.error('Failed to save session start:', error);
    }
  }

  async endSession(): Promise<void> {
    this.sessionData.endTime = new Date();
    
    // End ElevenLabs session
    await this.conversation.endSession();
    
    // Save final session data
    await this.saveSessionEnd();
    
    // Generate AI feedback
    await this.generateFeedback();
  }

  private async saveSessionEnd(): Promise<void> {
    if (!this.sessionData.id) return;

    const duration = this.sessionData.endTime!.getTime() - this.sessionData.startTime.getTime();

    try {
      await fetch(`/api/training_sessions/${this.sessionData.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getClerkToken()}`
        },
        body: JSON.stringify({
          training_session: {
            ended_at: this.sessionData.endTime!.toISOString(),
            duration_seconds: Math.floor(duration / 1000),
            conversation_transcript: this.sessionData.transcript.join('\n'),
            status: 'completed'
          }
        })
      });
    } catch (error) {
      console.error('Failed to save session end:', error);
    }
  }

  onMessage(message: any): void {
    // Log all conversation messages
    this.sessionData.transcript.push(`${message.type}: ${message.content}`);
  }

  private async getClerkToken(): Promise<string> {
    // Implementation depends on your Clerk setup
    return 'your-clerk-token';
  }
}
```

## Advanced Session Features

### Real-time Transcript Logging

```typescript
export function useSessionTranscript(conversation: any) {
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  
  interface TranscriptEntry {
    id: string;
    timestamp: Date;
    speaker: 'user' | 'ai';
    content: string;
    type: 'final' | 'partial';
  }

  useEffect(() => {
    const handleMessage = (message: any) => {
      const entry: TranscriptEntry = {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        speaker: message.source === 'user' ? 'user' : 'ai',
        content: message.text || message.content,
        type: message.is_final ? 'final' : 'partial'
      };
      
      setTranscript(prev => {
        // Replace partial messages with final versions
        if (entry.type === 'final' && prev.length > 0) {
          const lastEntry = prev[prev.length - 1];
          if (lastEntry.speaker === entry.speaker && lastEntry.type === 'partial') {
            return [...prev.slice(0, -1), entry];
          }
        }
        
        return [...prev, entry];
      });
    };

    // Set up message listener with ElevenLabs conversation
    conversation.onMessage?.(handleMessage);
    
    return () => {
      // Cleanup listener
    };
  }, [conversation]);

  return { transcript, clearTranscript: () => setTranscript([]) };
}
```

### Session Analytics & Metrics

```typescript
interface SessionMetrics {
  totalDuration: number;
  userSpeakingTime: number;
  aiSpeakingTime: number;
  numberOfExchanges: number;
  objectionsCovered: string[];
  averageResponseTime: number;
  sentimentScore?: number;
}

export function useSessionAnalytics(conversation: any, persona: PersonaConfig) {
  const [metrics, setMetrics] = useState<SessionMetrics>({
    totalDuration: 0,
    userSpeakingTime: 0,
    aiSpeakingTime: 0,
    numberOfExchanges: 0,
    objectionsCovered: [],
    averageResponseTime: 0
  });

  const [sessionStart] = useState(Date.now());
  const [lastSpeakingChange, setLastSpeakingChange] = useState(Date.now());

  useEffect(() => {
    // Track speaking time
    const now = Date.now();
    const elapsed = now - lastSpeakingChange;
    
    setMetrics(prev => {
      if (conversation.isSpeaking) {
        return {
          ...prev,
          aiSpeakingTime: prev.aiSpeakingTime + elapsed,
          totalDuration: now - sessionStart
        };
      } else {
        return {
          ...prev,
          userSpeakingTime: prev.userSpeakingTime + elapsed,
          totalDuration: now - sessionStart
        };
      }
    });
    
    setLastSpeakingChange(now);
  }, [conversation.isSpeaking, sessionStart, lastSpeakingChange]);

  const analyzeObjectionsCovered = (transcript: string[]): string[] => {
    const coveredObjections: string[] = [];
    const transcriptText = transcript.join(' ').toLowerCase();
    
    persona.objection_patterns.forEach(objection => {
      if (transcriptText.includes(objection.toLowerCase())) {
        coveredObjections.push(objection);
      }
    });
    
    return coveredObjections;
  };

  return { metrics, analyzeObjectionsCovered };
}
```

### AI Feedback Generation

```typescript
interface FeedbackReport {
  overallScore: number; // 1-10
  strengths: string[];
  areasForImprovement: string[];
  specificFeedback: {
    rapportBuilding: number;
    objectionHandling: number;
    questionQuality: number;
    closingTechnique: number;
  };
  recommendations: string[];
}

export class FeedbackGenerator {
  private apiKey: string;
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateFeedback(
    transcript: string[],
    sessionMetrics: SessionMetrics,
    persona: PersonaConfig
  ): Promise<FeedbackReport> {
    const prompt = this.buildFeedbackPrompt(transcript, sessionMetrics, persona);
    
    try {
      // Use your preferred AI service (GPT-4, Claude, etc.)
      const response = await fetch('/api/generate_feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          prompt,
          transcript: transcript.join('\n'),
          metrics: sessionMetrics
        })
      });
      
      const result = await response.json();
      return this.parseFeedbackResponse(result.content);
    } catch (error) {
      console.error('Failed to generate feedback:', error);
      throw error;
    }
  }

  private buildFeedbackPrompt(
    transcript: string[],
    metrics: SessionMetrics,
    persona: PersonaConfig
  ): string {
    return `
      Analyze this land acquisition roleplay conversation and provide detailed feedback.
      
      CONTEXT:
      - Student was practicing acquisition calls with an AI seller
      - Seller persona: ${persona.name} (${persona.conversation_style}, ${persona.motivation_level} motivation)
      - Property: ${persona.property_type} in ${persona.location}
      - Expected objections: ${persona.objection_patterns.join(', ')}
      
      SESSION METRICS:
      - Total duration: ${Math.floor(metrics.totalDuration / 1000)} seconds
      - Number of exchanges: ${metrics.numberOfExchanges}
      - Student speaking time: ${Math.floor(metrics.userSpeakingTime / 1000)} seconds
      - Objections covered: ${metrics.objectionsCovered.join(', ')}
      
      CONVERSATION TRANSCRIPT:
      ${transcript.join('\n')}
      
      Please provide feedback in JSON format with:
      1. overallScore (1-10)
      2. strengths (array of positive observations)
      3. areasForImprovement (array of specific areas to work on)
      4. specificFeedback (scores 1-10 for rapportBuilding, objectionHandling, questionQuality, closingTechnique)
      5. recommendations (array of actionable next steps)
      
      Focus on practical land acquisition techniques and communication skills.
    `;
  }

  private parseFeedbackResponse(response: string): FeedbackReport {
    try {
      return JSON.parse(response);
    } catch (error) {
      // Fallback if JSON parsing fails
      return {
        overallScore: 5,
        strengths: ['Completed the session'],
        areasForImprovement: ['Continue practicing'],
        specificFeedback: {
          rapportBuilding: 5,
          objectionHandling: 5,
          questionQuality: 5,
          closingTechnique: 5
        },
        recommendations: ['Practice more sessions', 'Focus on specific techniques']
      };
    }
  }
}
```

## Usage Tracking & Limits

### Free Tier Session Management

```typescript
interface UsageLimits {
  maxSessionsPerDay: number;
  maxSessionDurationMinutes: number;
  currentUsage: {
    sessionsToday: number;
    totalMinutesToday: number;
  };
}

export function useUsageLimits(userId: string) {
  const [limits, setLimits] = useState<UsageLimits>({
    maxSessionsPerDay: 3, // Free tier limit
    maxSessionDurationMinutes: 10,
    currentUsage: {
      sessionsToday: 0,
      totalMinutesToday: 0
    }
  });

  useEffect(() => {
    fetchCurrentUsage();
  }, [userId]);

  const fetchCurrentUsage = async () => {
    try {
      const response = await fetch(`/api/users/${userId}/usage_today`);
      const usage = await response.json();
      
      setLimits(prev => ({
        ...prev,
        currentUsage: usage
      }));
    } catch (error) {
      console.error('Failed to fetch usage:', error);
    }
  };

  const canStartSession = (): boolean => {
    return limits.currentUsage.sessionsToday < limits.maxSessionsPerDay;
  };

  const getRemainingMinutes = (): number => {
    const totalAllowed = limits.maxSessionsPerDay * limits.maxSessionDurationMinutes;
    return totalAllowed - limits.currentUsage.totalMinutesToday;
  };

  return {
    limits,
    canStartSession,
    getRemainingMinutes,
    refreshUsage: fetchCurrentUsage
  };
}
```

### Session Timer with Auto-termination

```typescript
export function useSessionTimer(
  maxDurationMinutes: number,
  onTimeWarning: (minutesLeft: number) => void,
  onTimeUp: () => void
) {
  const [sessionTime, setSessionTime] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setSessionTime(prev => {
          const newTime = prev + 1;
          const minutesElapsed = Math.floor(newTime / 60);
          const minutesLeft = maxDurationMinutes - minutesElapsed;
          
          // Warning at 2 minutes left
          if (minutesLeft === 2 && newTime % 60 === 0) {
            onTimeWarning(minutesLeft);
          }
          
          // Time up
          if (minutesElapsed >= maxDurationMinutes) {
            setIsActive(false);
            onTimeUp();
            return newTime;
          }
          
          return newTime;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, maxDurationMinutes, onTimeWarning, onTimeUp]);

  const start = () => setIsActive(true);
  const stop = () => setIsActive(false);
  const reset = () => {
    setSessionTime(0);
    setIsActive(false);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    sessionTime,
    formattedTime: formatTime(sessionTime),
    isActive,
    start,
    stop,
    reset,
    minutesLeft: Math.max(0, maxDurationMinutes - Math.floor(sessionTime / 60))
  };
}
```

## Complete Training Component

```typescript
import { TrainingSessionManager, FeedbackGenerator } from './training-session-manager';
import { useSessionTimer, useUsageLimits } from './usage-hooks';
import { PhoneTrainingInterface } from './phone-interface';

interface TrainingSessionProps {
  persona: PersonaConfig;
  userId: string;
  onSessionComplete: (feedback: FeedbackReport) => void;
}

export function TrainingSession({ 
  persona, 
  userId, 
  onSessionComplete 
}: TrainingSessionProps) {
  const conversation = useConversation();
  const [sessionManager] = useState(() => 
    new TrainingSessionManager(conversation, persona, userId)
  );
  const [feedbackGenerator] = useState(() => 
    new FeedbackGenerator(process.env.VITE_OPENAI_API_KEY!)
  );

  const { limits, canStartSession } = useUsageLimits(userId);
  const sessionTimer = useSessionTimer(
    limits.maxSessionDurationMinutes,
    (minutesLeft) => alert(`${minutesLeft} minutes remaining!`),
    () => handleTimeUp()
  );

  const [isSessionActive, setIsSessionActive] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackReport | null>(null);

  const startSession = async () => {
    if (!canStartSession()) {
      alert('Daily session limit reached. Upgrade to continue training.');
      return;
    }

    try {
      await sessionManager.startSession(persona);
      setIsSessionActive(true);
      sessionTimer.start();
    } catch (error) {
      alert('Failed to start training session. Please try again.');
    }
  };

  const endSession = async () => {
    setIsSessionActive(false);
    sessionTimer.stop();
    
    // Generate feedback
    const sessionFeedback = await feedbackGenerator.generateFeedback(
      sessionManager.getTranscript(),
      sessionManager.getMetrics(),
      persona
    );
    
    setFeedback(sessionFeedback);
    onSessionComplete(sessionFeedback);
    
    await sessionManager.endSession();
  };

  const handleTimeUp = () => {
    endSession();
    alert('Training session time limit reached. Session ended automatically.');
  };

  if (feedback) {
    return <FeedbackDisplay feedback={feedback} onClose={() => setFeedback(null)} />;
  }

  return (
    <div className="training-session">
      <div className="session-header">
        <h2>Training with {persona.name}</h2>
        <div className="session-info">
          <span>Time: {sessionTimer.formattedTime}</span>
          <span>Sessions today: {limits.currentUsage.sessionsToday}/{limits.maxSessionsPerDay}</span>
        </div>
      </div>

      <PhoneTrainingInterface
        conversation={conversation}
        personaData={persona}
        isActive={isSessionActive}
        onEndSession={endSession}
      />

      {!isSessionActive && (
        <div className="session-controls">
          <button 
            onClick={startSession}
            disabled={!canStartSession()}
            className="start-session-btn"
          >
            Start Training Call
          </button>
          
          {!canStartSession() && (
            <p className="limit-notice">
              Daily limit reached. <a href="/upgrade">Upgrade</a> for unlimited sessions.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
```

## Backend Integration

### Rails Controller Example

```ruby
# app/controllers/api/training_sessions_controller.rb
class Api::TrainingSessionsController < ApplicationController
  include Secured
  
  def create
    @training_session = current_user.training_sessions.build(training_session_params)
    @training_session.status = 'active'
    
    if @training_session.save
      render json: TrainingSessionBlueprint.render(@training_session), status: :created
    else
      render json: { errors: @training_session.errors }, status: :unprocessable_entity
    end
  end
  
  def update
    @training_session = current_user.training_sessions.find(params[:id])
    
    if @training_session.update(training_session_params)
      # Generate AI feedback if session completed
      if @training_session.completed? && @training_session.conversation_transcript.present?
        GenerateFeedbackJob.perform_later(@training_session.id)
      end
      
      render json: TrainingSessionBlueprint.render(@training_session)
    else
      render json: { errors: @training_session.errors }, status: :unprocessable_entity
    end
  end
  
  def usage_today
    today = Date.current
    usage = {
      sessions_today: current_user.training_sessions.where(created_at: today.all_day).count,
      total_minutes_today: current_user.training_sessions
                                     .where(created_at: today.all_day)
                                     .sum(:duration_seconds) / 60
    }
    
    render json: usage
  end
  
  private
  
  def training_session_params
    params.require(:training_session).permit(
      :persona_id, :started_at, :ended_at, :duration_seconds,
      :conversation_transcript, :ai_feedback_score, :status
    )
  end
end
```

This comprehensive training session implementation provides everything needed for your land acquisition roleplay trainer, including persona management, usage limits, real-time feedback, and seamless integration with your Rails backend.