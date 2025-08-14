export interface UserProfile {
  id: number
  type: string
  clerkUserId: string
  sessionsRemaining: number
  inviteCodeRedeemed: boolean
  createdAt: number
  updatedAt: number
}