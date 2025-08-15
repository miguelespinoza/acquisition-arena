import { useEffect, useRef, useState } from 'react'

interface WaveformVisualizerProps {
  isActive: boolean
  height?: number
  barCount?: number
  color?: string
  className?: string
}

export function WaveformVisualizer({ 
  isActive, 
  height = 40, 
  barCount = 5, 
  color = '#10B981',
  className = ''
}: WaveformVisualizerProps) {
  const [bars, setBars] = useState<number[]>(Array(barCount).fill(0.2))
  const intervalRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (isActive) {
      // Animate bars when active
      intervalRef.current = setInterval(() => {
        setBars(prev => prev.map(() => Math.random() * 0.8 + 0.2))
      }, 150)
    } else {
      // Reset to minimal state when inactive
      setBars(Array(barCount).fill(0.2))
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isActive, barCount])

  return (
    <div 
      className={`flex items-end justify-center space-x-1 ${className}`}
      style={{ height: `${height}px` }}
    >
      {bars.map((intensity, index) => (
        <div
          key={index}
          className="transition-all duration-150 ease-in-out rounded-full"
          style={{
            width: '4px',
            height: `${Math.max(4, intensity * height)}px`,
            backgroundColor: isActive ? color : '#D1D5DB',
            transform: isActive ? `scaleY(${0.5 + intensity * 0.5})` : 'scaleY(0.5)'
          }}
        />
      ))}
    </div>
  )
}

interface AdvancedWaveformVisualizerProps {
  conversation?: any // ElevenLabs conversation object
  isActive: boolean
  width?: number
  height?: number
  className?: string
}

export function AdvancedWaveformVisualizer({
  conversation,
  isActive,
  width = 200,
  height = 60,
  className = ''
}: AdvancedWaveformVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const dataArray = useRef<Uint8Array>()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = width
    canvas.height = height

    const draw = () => {
      if (!ctx || !isActive) {
        // Draw static waveform when inactive
        ctx.clearRect(0, 0, width, height)
        ctx.fillStyle = '#E5E7EB'
        ctx.fillRect(0, height / 2 - 1, width, 2)
        return
      }

      ctx.clearRect(0, 0, width, height)

      // Create simulated audio data if no real data available
      const bufferLength = 64
      if (!dataArray.current) {
        dataArray.current = new Uint8Array(bufferLength)
      }

      // Simulate audio data with random values
      for (let i = 0; i < bufferLength; i++) {
        dataArray.current[i] = Math.random() * 255
      }

      const barWidth = width / bufferLength
      let barHeight
      let x = 0

      // Draw frequency bars
      for (let i = 0; i < bufferLength; i++) {
        barHeight = (dataArray.current[i] / 255) * height * 0.8

        // Create gradient
        const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight)
        gradient.addColorStop(0, '#10B981')
        gradient.addColorStop(1, '#34D399')

        ctx.fillStyle = gradient
        ctx.fillRect(x, height - barHeight, barWidth - 1, barHeight)

        x += barWidth
      }

      animationRef.current = requestAnimationFrame(draw)
    }

    if (isActive) {
      draw()
      animationRef.current = requestAnimationFrame(draw)
    } else {
      draw() // Draw static state
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isActive, width, height])

  return (
    <canvas
      ref={canvasRef}
      className={`rounded ${className}`}
      style={{ width: `${width}px`, height: `${height}px` }}
    />
  )
}

// Simple pulsing dot visualizer
export function PulsingDotVisualizer({ 
  isActive, 
  size = 12, 
  color = '#10B981',
  className = ''
}: {
  isActive: boolean
  size?: number
  color?: string
  className?: string
}) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`rounded-full transition-all duration-300 ${
          isActive ? 'animate-pulse' : ''
        }`}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          backgroundColor: isActive ? color : '#D1D5DB',
          transform: isActive ? 'scale(1.2)' : 'scale(1)'
        }}
      />
    </div>
  )
}