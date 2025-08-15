import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useSWR from 'swr'
import { useApiClient } from '@/lib/api'
import type { Persona, Parcel, TrainingSession } from '@/types'
import toast from 'react-hot-toast'
import { Phone, ChevronLeft, PlayCircle, Loader2 } from 'lucide-react'
import { getPersonaAvatar } from '@/utils/avatar'

type Step = 'persona' | 'parcel' | 'confirm'

export default function CreateSessionPage() {
  const navigate = useNavigate()
  const apiClient = useApiClient()
  const [currentStep, setCurrentStep] = useState<Step>('persona')
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null)
  const [selectedParcel, setSelectedParcel] = useState<Parcel | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  // Fetch personas and parcels using SWR
  const { data: personas, error: personasError, isLoading: personasLoading } = useSWR<Persona[]>(
    '/personas',
    () => apiClient.get<Persona[]>('/personas')
  )

  const { data: parcels, error: parcelsError, isLoading: parcelsLoading } = useSWR<Parcel[]>(
    currentStep === 'parcel' ? '/parcels' : null,
    () => apiClient.get<Parcel[]>('/parcels')
  )

  const handlePersonaSelect = (persona: Persona) => {
    setSelectedPersona(persona)
    setCurrentStep('parcel')
  }

  const handleParcelSelect = (parcel: Parcel) => {
    setSelectedParcel(parcel)
    setCurrentStep('confirm')
  }

  const handleCreateSession = async () => {
    if (!selectedPersona || !selectedParcel) return

    setIsCreating(true)
    try {
      const session = await apiClient.post<TrainingSession>('/training_sessions', {
        training_session: {
          persona_id: selectedPersona.id,
          parcel_id: selectedParcel.id,
        },
      })

      toast.success('Training session created!')
      navigate(`/session/${session.id}`)
    } catch (error) {
      console.error('Failed to create session:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create session')
    } finally {
      setIsCreating(false)
    }
  }

  const handleBack = () => {
    if (currentStep === 'parcel') {
      setCurrentStep('persona')
      setSelectedPersona(null)
    } else if (currentStep === 'confirm') {
      setCurrentStep('parcel')
      setSelectedParcel(null)
    } else {
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto py-12 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleBack}
              className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Create Training Session</h1>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <div className={`px-3 py-1 rounded-full ${currentStep === 'persona' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'}`}>
              1. Select Persona
            </div>
            <div className={`px-3 py-1 rounded-full ${currentStep === 'parcel' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'}`}>
              2. Select Parcel
            </div>
            <div className={`px-3 py-1 rounded-full ${currentStep === 'confirm' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'}`}>
              3. Confirm
            </div>
          </div>
        </div>

        {/* Step 1: Select Persona */}
        {currentStep === 'persona' && (
          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Choose Your Seller Persona</h2>
              <p className="text-gray-600">Select the type of property owner you'd like to practice negotiating with.</p>
            </div>

            {personasLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-lg text-gray-600">Loading personas...</div>
              </div>
            )}

            {personasError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
                <p className="text-red-800">Failed to load personas. Please try again.</p>
              </div>
            )}

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {personas?.map((persona) => (
                <div
                  key={persona.id}
                  onClick={() => handlePersonaSelect(persona)}
                  className="bg-white rounded-xl p-6 cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                >
                  <div className="flex items-center mb-4">
                    {persona.avatarUrl || getPersonaAvatar(persona.id) ? (
                      <img
                        src={persona.avatarUrl || getPersonaAvatar(persona.id)!}
                        alt={persona.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-lg">
                          {persona.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <h3 className="ml-3 text-xl font-semibold text-gray-900">{persona.name}</h3>
                  </div>
                  <p className="text-gray-600 mb-4">{persona.description}</p>
                  {persona.characteristics && typeof persona.characteristics === 'object' && (
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(persona.characteristics).slice(0, 3).map(([key, value]) => (
                        <span
                          key={key}
                          className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                        >
                          {String(value)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Select Parcel */}
        {currentStep === 'parcel' && selectedPersona && (
          <div>
            <div className="mb-8">
              <div className="bg-white rounded-xl p-4 mb-6">
                <div className="flex items-center">
                  {selectedPersona.avatarUrl || getPersonaAvatar(selectedPersona.id) ? (
                    <img
                      src={selectedPersona.avatarUrl || getPersonaAvatar(selectedPersona.id)!}
                      alt={selectedPersona.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {selectedPersona.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className="ml-3">
                    <p className="text-sm text-gray-600">Selected Persona:</p>
                    <p className="font-semibold text-gray-900">{selectedPersona.name}</p>
                  </div>
                </div>
              </div>
              
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Choose a Property Parcel</h2>
              <p className="text-gray-600">Select the property you'd like to practice negotiating for.</p>
            </div>

            {parcelsLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-lg text-gray-600">Loading parcels...</div>
              </div>
            )}

            {parcelsError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
                <p className="text-red-800">Failed to load parcels. Please try again.</p>
              </div>
            )}

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {parcels?.map((parcel) => (
                <div
                  key={parcel.id}
                  onClick={() => handleParcelSelect(parcel)}
                  className="bg-white rounded-xl p-6 cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                >
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-400 rounded-lg flex items-center justify-center">
                      <Phone className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="ml-3 text-xl font-semibold text-gray-900">Parcel #{parcel.parcelNumber}</h3>
                  </div>
                  <p className="text-gray-600 mb-4 font-medium">{parcel.location}</p>
                  {parcel.propertyFeatures && typeof parcel.propertyFeatures === 'object' && (
                    <div className="space-y-2">
                      {Object.entries(parcel.propertyFeatures).slice(0, 3).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="text-gray-600 capitalize">{key.replace('_', ' ')}:</span>
                          <span className="text-gray-900 font-medium">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Confirm */}
        {currentStep === 'confirm' && selectedPersona && selectedParcel && (
          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Confirm Your Selection</h2>
              <p className="text-gray-600">Review your choices and start your training session.</p>
            </div>

            <div className="w-full">
              {/* Side by side cards on desktop */}
              <div className="grid lg:grid-cols-2 gap-6 mb-24 lg:items-start">
                {/* Selected Persona */}
                <div className="bg-white rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Selected Persona</h3>
                  <div className="flex items-center">
                    {selectedPersona.avatarUrl || getPersonaAvatar(selectedPersona.id) ? (
                      <img
                        src={selectedPersona.avatarUrl || getPersonaAvatar(selectedPersona.id)!}
                        alt={selectedPersona.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-xl">
                          {selectedPersona.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div className="ml-4">
                      <h4 className="text-xl font-semibold text-gray-900">{selectedPersona.name}</h4>
                      <p className="text-gray-600">{selectedPersona.description}</p>
                    </div>
                  </div>
                </div>

                {/* Selected Parcel */}
                <div className="bg-white rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Selected Property</h3>
                  <div className="flex items-center mb-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-400 rounded-lg flex items-center justify-center">
                      <PlayCircle className="w-8 h-8 text-white" />
                    </div>
                    <div className="ml-4">
                      <h4 className="text-xl font-semibold text-gray-900">Parcel #{selectedParcel.parcelNumber}</h4>
                      <p className="text-gray-600 font-medium">{selectedParcel.location}</p>
                    </div>
                  </div>
                  {selectedParcel.propertyFeatures && typeof selectedParcel.propertyFeatures === 'object' && (
                    <div className="grid grid-cols-1 gap-2">
                      {Object.entries(selectedParcel.propertyFeatures).map(([key, value]) => (
                        <div key={key} className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600 capitalize">{key.replace('_', ' ')}:</span>
                          <span className="text-gray-900 font-medium">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Fixed floating button at bottom */}
              <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-10">
                <button
                  onClick={handleCreateSession}
                  disabled={isCreating}
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold text-lg rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                      Creating Session...
                    </>
                  ) : (
                    <>
                      <Phone className="w-6 h-6 mr-2" fill="white" strokeWidth={0} />
                      Start Training Session
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}