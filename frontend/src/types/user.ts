export interface UserProfile {
  id: number
  type: string
  clerkUserId: string
  sessionsRemaining: number
  inviteCodeRedeemed: boolean
  firstName: string | null
  lastName: string | null
  createdAt: number
  updatedAt: number
}