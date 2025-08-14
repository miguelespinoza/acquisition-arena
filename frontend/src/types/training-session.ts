import type { Persona } from './persona'
import type { Parcel } from './parcel'

export interface TrainingSession {
  id: number
  userId: number
  personaId: number
  parcelId: number
  status: 'pending' | 'active' | 'completed' | 'failed'
  gradeStars: number | null
  feedbackMarkdown: string | null
  conversationTranscript: string | null
  sessionDuration: number | null
  audioUrl: string | null
  elevenlabsSessionToken: string | null
  createdAt: string
  updatedAt: string
  persona?: Persona
  parcel?: Parcel
}