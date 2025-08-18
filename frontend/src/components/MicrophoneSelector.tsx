import { useState, useEffect, useRef, useCallback } from 'react'
import { Mic, MicOff, ChevronDown, CheckCircle, AlertCircle } from 'lucide-react'

interface MicrophoneSelectorProps {
  onMicrophoneSelected: (deviceId: string) => void
  onContinue: () => void
}

export function MicrophoneSelector({ onMicrophoneSelected, onContinue }: MicrophoneSelectorProps) {
  const [microphones, setMicrophones] = useState<MediaDeviceInfo[]>([])
  const [selectedMicId, setSelectedMicId] = useState<string>('')
  const [audioLevel, setAudioLevel] = useState(0)
  const [isTestingAudio, setIsTestingAudio] = useState(false)
  const [permissionStatus, setPermissionStatus] = useState<'prompt' | 'granted' | 'denied'>('prompt')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  // Get available microphones
  const getMicrophones = useCallback(async () => {
    try {
      // First request permission if needed
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      setPermissionStatus('granted')
      
      // Get devices after permission is granted
      const devices = await navigator.mediaDevices.enumerateDevices()
      const mics = devices.filter(device => device.kind === 'audioinput')
      setMicrophones(mics)
      
      // Select the default mic or first available
      const defaultMic = mics.find(mic => mic.deviceId === 'default') || mics[0]
      if (defaultMic && !selectedMicId) {
        setSelectedMicId(defaultMic.deviceId)
        onMicrophoneSelected(defaultMic.deviceId)
      }
      
      // Clean up the permission stream
      stream.getTracks().forEach(track => track.stop())
      
      // Start testing with the selected mic
      if (defaultMic) {
        startAudioTest(defaultMic.deviceId)
      }
    } catch (error) {
      console.error('Error getting microphones:', error)
      if (error instanceof DOMException && error.name === 'NotAllowedError') {
        setPermissionStatus('denied')
      }
    }
  }, [selectedMicId, onMicrophoneSelected])

  // Start audio level monitoring
  const startAudioTest = useCallback(async (deviceId: string) => {
    try {
      // Stop any existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }

      // Get audio stream with selected device
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: deviceId ? { exact: deviceId } : undefined,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      })
      streamRef.current = stream

      // Create audio context and analyser
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      audioContextRef.current = audioContext
      
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 256
      analyser.smoothingTimeConstant = 0.8
      analyserRef.current = analyser
      
      const source = audioContext.createMediaStreamSource(stream)
      source.connect(analyser)
      
      setIsTestingAudio(true)
      
      // Start monitoring audio levels
      const checkAudioLevel = () => {
        if (!analyserRef.current) return
        
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
        analyserRef.current.getByteFrequencyData(dataArray)
        
        // Calculate average volume
        const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length
        const normalizedLevel = Math.min(100, (average / 128) * 100)
        
        setAudioLevel(normalizedLevel)
        
        animationFrameRef.current = requestAnimationFrame(checkAudioLevel)
      }
      
      checkAudioLevel()
    } catch (error) {
      console.error('Error starting audio test:', error)
      setIsTestingAudio(false)
    }
  }, [])

  // Handle microphone selection
  const handleMicrophoneChange = useCallback((deviceId: string) => {
    setSelectedMicId(deviceId)
    onMicrophoneSelected(deviceId)
    setIsDropdownOpen(false)
    startAudioTest(deviceId)
  }, [onMicrophoneSelected, startAudioTest])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  // Initialize on mount
  useEffect(() => {
    getMicrophones()
  }, [getMicrophones])

  // Listen for device changes
  useEffect(() => {
    const handleDeviceChange = () => {
      getMicrophones()
    }
    
    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange)
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange)
    }
  }, [getMicrophones])

  const selectedMic = microphones.find(mic => mic.deviceId === selectedMicId)

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center border-4 ${
            isTestingAudio && audioLevel > 10 
              ? 'bg-green-100 border-green-400' 
              : 'bg-gray-100 border-gray-300'
          } transition-colors duration-200`}>
            {isTestingAudio && audioLevel > 10 ? (
              <Mic className="w-12 h-12 text-green-600" />
            ) : (
              <MicOff className="w-12 h-12 text-gray-400" />
            )}
          </div>
        </div>
        
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">🎤 Set Up Your Microphone</h2>
          <p className="text-gray-600">Select your microphone and make sure it's working</p>
        </div>
      </div>

      {permissionStatus === 'denied' ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-2" />
            <div className="text-sm text-red-700">
              <p className="font-medium">Microphone access denied</p>
              <p>Please allow microphone access in your browser settings to continue.</p>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Microphone Dropdown */}
          {microphones.length > 1 && (
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Microphone
              </label>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-left flex items-center justify-between hover:border-gray-400 transition-colors"
              >
                <span className="truncate">
                  {selectedMic?.label || 'Select a microphone'}
                </span>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${
                  isDropdownOpen ? 'rotate-180' : ''
                }`} />
              </button>
              
              {isDropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                  {microphones.map((mic) => (
                    <button
                      key={mic.deviceId}
                      onClick={() => handleMicrophoneChange(mic.deviceId)}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                        mic.deviceId === selectedMicId ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="truncate">{mic.label || `Microphone ${mic.deviceId.slice(0, 8)}`}</span>
                        {mic.deviceId === selectedMicId && (
                          <CheckCircle className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Audio Level Visualizer */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Audio Level
            </label>
            <div className="bg-gray-200 rounded-full h-6 overflow-hidden">
              <div 
                className={`h-full transition-all duration-100 ${
                  audioLevel > 50 ? 'bg-yellow-500' : 
                  audioLevel > 10 ? 'bg-green-500' : 
                  'bg-gray-300'
                }`}
                style={{ width: `${audioLevel}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {audioLevel > 10 ? '✓ Your microphone is working' : 'Speak to test your microphone'}
            </p>
          </div>

          {/* Audio Waveform Bars */}
          <div className="flex justify-center items-center space-x-1 h-16">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className={`w-1 bg-gradient-to-t from-blue-500 to-blue-300 rounded-full transition-all duration-75 ${
                  isTestingAudio ? '' : 'opacity-30'
                }`}
                style={{
                  height: isTestingAudio 
                    ? `${Math.max(8, Math.min(64, audioLevel * (0.5 + Math.random())))}px`
                    : '8px'
                }}
              />
            ))}
          </div>

          {/* Continue Button */}
          <div className="flex justify-center">
            <button
              onClick={onContinue}
              disabled={!isTestingAudio || audioLevel < 5}
              className={`px-8 py-3 rounded-lg font-medium transition-all ${
                isTestingAudio && audioLevel > 5
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isTestingAudio && audioLevel > 5 ? 'Continue to Call' : 'Test Your Microphone First'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}