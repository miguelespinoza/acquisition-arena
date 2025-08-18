import type { Persona } from './persona'
import type { Parcel } from './parcel'

export interface TrainingSession {
  id: number
  userId: number
  personaId: number
  parcelId: number
  status: 'pending' | 'active' | 'generating_feedback' | 'completed' | 'failed'
  conversationTranscript: string | null
  sessionDuration: number | null
  audioUrl: string | null
  elevenlabsSessionToken: string | null
  feedbackScore: number | null
  feedbackText: string | null
  feedbackGrade: string | null
  feedbackGeneratedAt: string | null
  createdAt: string
  updatedAt: string
  persona?: Persona
  parcel?: Parcel
}