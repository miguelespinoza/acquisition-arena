export interface Persona {
  id: number
  name: string
  description: string
  avatarUrl: string | null
  characteristics: Record<string, unknown>
  characteristicsVersion: string
  createdAt: string
  updatedAt: string
}