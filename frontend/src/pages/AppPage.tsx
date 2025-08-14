import { useAuth, useUser } from '@clerk/clerk-react'
import { useEffect, useState } from 'react'

export default function AppPage() {
  const { getToken, signOut } = useAuth()
  const { user } = useUser()
  const [jwt, setJwt] = useState<string | null>(null)

  useEffect(() => {
    const fetchToken = async () => {
      console.log('Fetching token...')
      try {
        const token = await getToken()
        setJwt(token)
        console.log('Clerk JWT:', token)
      } catch (error) {
        console.error('Failed to get token:', error)
      }
    }

    fetchToken()
  }, [getToken])

  const handleLogout = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Failed to sign out:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="bg-white rounded-lg shadow-md p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome to Acquisition Arena
              </h1>
              <p className="text-gray-600 mt-2">
                Hello, {user?.firstName || user?.emailAddresses[0]?.emailAddress}!
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>

          {/* User Info */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">User Information</h2>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <p><strong>Email:</strong> {user?.emailAddresses[0]?.emailAddress}</p>
                <p><strong>Name:</strong> {user?.firstName} {user?.lastName}</p>
                <p><strong>User ID:</strong> {user?.id}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">JWT Token</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                {jwt ? (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">Token (check console for full token):</p>
                    <code className="text-xs break-all bg-gray-100 p-2 rounded block">
                      {jwt.substring(0, 100)}...
                    </code>
                    <button
                      onClick={() => navigator.clipboard.writeText(jwt)}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                    >
                      Copy Full Token
                    </button>
                  </div>
                ) : (
                  <p className="text-gray-500">Loading JWT token...</p>
                )}
              </div>
            </div>
          </div>

          {/* Placeholder for future features */}
          <div className="mt-8 p-6 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">
              Ready for Voice Roleplay!
            </h3>
            <p className="text-blue-600">
              Your authentication is set up. The next step will be to integrate ElevenLabs 
              for conversational AI features.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}