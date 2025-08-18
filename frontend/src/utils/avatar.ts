export const getPersonaAvatar = (avatarUrl: string | null, prefixPath: string  = ""): string | null => {
  if (!avatarUrl) return null;
  
  // Handle relative paths - check if file exists in public directory
  if (avatarUrl.startsWith('/')) {
    const filename = avatarUrl.substring(1); // Remove leading slash
    console.log('filename: ', filename)
    
    // List of known available avatar files
    const availableAvatars = ['sally_henderson.png', 'patricia_williams.png', 'robert_mitchell.png', 'frederick_chen.png', 'thomas_rodriguez.png', 'margaret_thompson.png'];
    
    // Check if the file exists in our available avatars
    if (availableAvatars.includes(filename)) {
      return `${prefixPath}avatars${avatarUrl}`;
    }
    
    // File doesn't exist, return null
    return null;
  }
  
  // Handle absolute URLs (external images)
  return avatarUrl;
}