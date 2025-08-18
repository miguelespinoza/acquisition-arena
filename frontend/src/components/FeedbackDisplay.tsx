import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { Trophy, TrendingUp, Target, ChevronDown, ChevronUp, Loader } from 'lucide-react'

interface FeedbackDisplayProps {
  score: number | null
  grade: string | null
  feedbackText: string | null
  isGenerating: boolean
  onRefresh?: () => void
}

export function FeedbackDisplay({ 
  score, 
  grade, 
  feedbackText, 
  isGenerating,
  onRefresh 
}: FeedbackDisplayProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['summary']))

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev)
      if (next.has(section)) {
        next.delete(section)
      } else {
        next.add(section)
      }
      return next
    })
  }

  const getGradeColor = (grade: string | null) => {
    if (!grade) return 'text-gray-600'
    if (grade.startsWith('A')) return 'text-green-600'
    if (grade.startsWith('B')) return 'text-blue-600'
    if (grade.startsWith('C')) return 'text-yellow-600'
    if (grade.startsWith('D')) return 'text-orange-600'
    return 'text-red-600'
  }

  const getScoreColor = (score: number | null) => {
    if (!score) return 'bg-gray-200'
    if (score >= 90) return 'bg-green-500'
    if (score >= 80) return 'bg-blue-500'
    if (score >= 70) return 'bg-yellow-500'
    if (score >= 60) return 'bg-orange-500'
    return 'bg-red-500'
  }

  if (isGenerating) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="relative">
            <Loader className="w-12 h-12 text-blue-600 animate-spin" />
            <div className="absolute inset-0 w-12 h-12">
              <div className="absolute inset-0 rounded-full border-4 border-blue-200 animate-ping"></div>
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900">Generating Your Feedback</h3>
          <p className="text-gray-600 text-center max-w-md">
            Our AI coach is analyzing your conversation and preparing personalized feedback...
          </p>
          <div className="w-full max-w-xs">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!score && !feedbackText) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="text-center space-y-4">
          <Target className="w-12 h-12 text-gray-400 mx-auto" />
          <h3 className="text-xl font-semibold text-gray-900">No Feedback Yet</h3>
          <p className="text-gray-600">Complete a training session to receive feedback.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Score Card */}
      {(score !== null || grade) && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Performance Score
            </h3>
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
              >
                Refresh
              </button>
            )}
          </div>
          
          <div className="flex items-center space-x-6">
            {/* Grade Display */}
            {grade && (
              <div className="text-center">
                <div className={`text-5xl font-bold ${getGradeColor(grade)}`}>
                  {grade}
                </div>
                <div className="text-sm text-gray-600 mt-1">Grade</div>
              </div>
            )}
            
            {/* Score Bar */}
            {score !== null && (
              <div className="flex-1">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Score</span>
                  <span className="font-semibold">{score}/100</span>
                </div>
                <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${getScoreColor(score)} transition-all duration-500`}
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Feedback Content */}
      {feedbackText && (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Detailed Feedback
            </h3>
            
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown
                components={{
                  h2: ({ children }) => {
                    const sectionId = children?.toString().toLowerCase().replace(/\s+/g, '-') || ''
                    const isExpanded = expandedSections.has(sectionId)
                    
                    return (
                      <button
                        onClick={() => toggleSection(sectionId)}
                        className="w-full flex items-center justify-between py-3 border-b border-gray-200 hover:bg-gray-50 transition-colors group"
                      >
                        <h2 className="text-base font-semibold text-gray-900 text-left">
                          {children}
                        </h2>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                        )}
                      </button>
                    )
                  },
                  p: ({ children, ...props }) => {
                    // Check if this paragraph follows an h2
                    const parent = props.node?.position
                    if (parent) {
                      // This is a crude way to determine if content should be collapsible
                      // In practice, you might want a more sophisticated approach
                      const sectionId = 'summary' // You'd need to track which section this belongs to
                      const isExpanded = expandedSections.has(sectionId)
                      
                      if (!isExpanded && sectionId !== 'summary') {
                        return null
                      }
                    }
                    
                    return <p className="text-gray-700 mb-3">{children}</p>
                  },
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside space-y-2 text-gray-700 mb-4">
                      {children}
                    </ul>
                  ),
                  li: ({ children }) => (
                    <li className="text-gray-700">
                      <span className="ml-2">{children}</span>
                    </li>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-semibold text-gray-900">{children}</strong>
                  ),
                }}
              >
                {feedbackText}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}