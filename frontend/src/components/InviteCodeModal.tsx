import { useState } from 'react'
import toast from 'react-hot-toast'
import { useApiClient } from '@/lib/api'

interface InviteCodeModalProps {
  onSuccess: () => void
}

export default function InviteCodeModal({ onSuccess }: InviteCodeModalProps) {
  const [inviteCode, setInviteCode] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const api = useApiClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!inviteCode.trim()) {
      toast.error('Please enter an invite code')
      return
    }

    setIsSubmitting(true)

    try {
      const data = await api.post<{ valid: boolean; message?: string; error?: string }>('/user/validate_invite', {
        invite_code: inviteCode
      })

      if (data.valid) {
        toast.success(data.message || 'Invite code redeemed successfully!')
        onSuccess()
      } else {
        toast.error(data.error || 'Invalid invite code')
      }
    } catch (error) {
      console.error('Error validating invite code:', error)
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error('Something went wrong. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome to Acquisition Arena
          </h2>
          <p className="text-gray-600">
            Enter your invite code to get started with voice-based acquisition training.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="inviteCode" className="block text-sm font-medium text-gray-700 mb-2">
              Invite Code
            </label>
            <input
              id="inviteCode"
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="Enter your invite code"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isSubmitting}
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            {isSubmitting ? 'Redeeming...' : 'Redeem Code'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Need an invite code? Email{' '}
            <a 
              href="mailto:miguel@crafted.app?subject=Acquisition Arena Invite Code Request"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              miguel@crafted.app
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}