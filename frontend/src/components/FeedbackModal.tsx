import { useState } from 'react'
import { X, Send } from 'lucide-react'
import { useApiClient } from '@/lib/api'
import toast from 'react-hot-toast'

interface FeedbackModalProps {
  isOpen: boolean
  onClose: () => void
  sessionId?: string
  embedded?: boolean
  title?: string
  subtitle?: string
  visible?: boolean
}

export function FeedbackModal({ 
  isOpen, 
  onClose, 
  sessionId, 
  embedded = false,
  title = "Submit Feedback",
  subtitle = "Help us improve your experience",
  visible = true
}: FeedbackModalProps) {
  const [feedback, setFeedback] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const apiClient = useApiClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!feedback.trim()) {
      toast.error('Please enter your feedback')
      return
    }

    setIsSubmitting(true)
    
    try {
      const payload: { feedback: string; session_id?: string } = { feedback: feedback.trim() }
      if (sessionId) {
        payload.session_id = sessionId
      }
      
      await apiClient.post('/feedback', payload)
      toast.success('Thank you for your feedback!')
      setFeedback('')
      if (!embedded) {
        onClose()
      }
    } catch (error) {
      console.error('Failed to submit feedback:', error)
      toast.error('Failed to submit feedback. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Don't unmount the component when closed to preserve state

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-2">
          Your Feedback
        </label>
        <textarea
          id="feedback"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder={sessionId 
            ? "Tell us about your training experience..."
            : "Share your thoughts, suggestions, or report issues..."
          }
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows={5}
          maxLength={1000}
          disabled={isSubmitting}
        />
        <div className="text-xs text-gray-500 mt-1 text-right">
          {feedback.length}/1000 characters
        </div>
      </div>
      
      <div className="flex justify-end space-x-3">
        {!embedded && (
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting || !feedback.trim()}
        >
          <Send className="w-4 h-4" />
          <span>{isSubmitting ? 'Sending...' : 'Send Feedback'}</span>
        </button>
      </div>
    </form>
  )

  if (embedded) {
    return (
      <div className={`bg-white rounded-xl p-6 shadow-lg ${!visible ? 'hidden' : ''}`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-4">{subtitle}</p>
        {formContent}
      </div>
    )
  }

  return (
    <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 ${!isOpen ? 'hidden' : ''}`}>
      <div className="bg-white rounded-xl max-w-lg w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-600 mb-6">{subtitle}</p>
        
        {formContent}
      </div>
    </div>
  )
}