// Temporary avatar mapping - TODO: remove when backend provides avatar URLs
export const getPersonaAvatar = (personaId: string): string | null => {
  const avatarMap: Record<string, string> = {
    '61b070c2-df2b-4ab3-aaab-39de45f12e4a': '/fred.png',    // Friendly Fred
    '77bc11bf-f711-4d0c-a094-c4b1749758aa': '/bob.png',     // Motivated Seller Bob  
    '7e871d43-2878-496a-9dfe-3afcb43442e3': '/sally.png'    // Skeptical Sally
  }
  return avatarMap[personaId] || null
}