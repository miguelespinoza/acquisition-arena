# Audio Visualization with ElevenLabs SDK

## Overview

The ElevenLabs SDK provides methods to access real-time audio data for creating waveform animations and voice activity visualizations. This guide covers implementing the phone-like interface with avatar waveform animations for your training app.

## Available Audio Data Methods

### Volume Methods
```typescript
// Get current input volume (user's microphone) - scale 0 to 1
const inputVolume = conversation.getInputVolume?.();

// Get current output volume (AI's voice) - scale 0 to 1  
const outputVolume = conversation.getOutputVolume?.();
```

### Frequency Data Methods
```typescript
// Get input frequency data for waveform visualization
const inputFrequencyData = conversation.getInputByteFrequencyData?.();

// Get output frequency data for AI voice visualization
const outputFrequencyData = conversation.getOutputByteFrequencyData?.();
```

Both frequency methods return `Uint8Array` objects similar to the Web Audio API's `AnalyserNode.getByteFrequencyData()`.

## Waveform Visualizer Component

### Basic Waveform Component

```typescript
import React, { useRef, useEffect, useState } from 'react';

interface WaveformVisualizerProps {
  conversation: any; // useConversation hook return value
  isActive: boolean; // conversation.isSpeaking
  width?: number;
  height?: number;
  color?: string;
  backgroundColor?: string;
}

export function WaveformVisualizer({
  conversation,
  isActive,
  width = 300,
  height = 60,
  color = '#3b82f6',
  backgroundColor = 'transparent'
}: WaveformVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isActive) {
      setIsVisible(false);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    setIsVisible(true);
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      // Get frequency data from AI output
      const frequencyData = conversation.getOutputByteFrequencyData?.();
      
      if (frequencyData) {
        drawWaveform(ctx, frequencyData, width, height, color, backgroundColor);
      } else {
        // Fallback animation when no frequency data
        drawFallbackAnimation(ctx, width, height, color, backgroundColor);
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, conversation, width, height, color, backgroundColor]);

  return (
    <div className={`waveform-container ${isVisible ? 'active' : 'inactive'}`}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{
          width: `${width}px`,
          height: `${height}px`,
          transition: 'opacity 0.3s ease'
        }}
      />
    </div>
  );
}

// Draw waveform from frequency data
function drawWaveform(
  ctx: CanvasRenderingContext2D,
  frequencyData: Uint8Array,
  width: number,
  height: number,
  color: string,
  backgroundColor: string
) {
  // Clear canvas
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, width, height);
  
  const centerY = height / 2;
  const barCount = Math.min(frequencyData.length, 64); // Limit bars for phone interface
  const barWidth = width / barCount;
  
  ctx.fillStyle = color;
  
  for (let i = 0; i < barCount; i++) {
    const barHeight = (frequencyData[i] / 255) * (height - 4);
    const x = i * barWidth;
    const y = centerY - barHeight / 2;
    
    // Draw rounded rectangle bars
    drawRoundedRect(ctx, x + 1, y, barWidth - 2, barHeight, 2);
  }
}

// Fallback animation when no frequency data available
function drawFallbackAnimation(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  color: string,
  backgroundColor: string
) {
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, width, height);
  
  const centerY = height / 2;
  const barCount = 32;
  const barWidth = width / barCount;
  const time = Date.now() * 0.01;
  
  ctx.fillStyle = color;
  
  for (let i = 0; i < barCount; i++) {
    // Create sine wave pattern
    const amplitude = Math.sin(time + i * 0.5) * 0.5 + 0.5;
    const barHeight = amplitude * (height - 8) * (0.5 + Math.random() * 0.5);
    const x = i * barWidth;
    const y = centerY - barHeight / 2;
    
    drawRoundedRect(ctx, x + 1, y, barWidth - 2, barHeight, 2);
  }
}

// Helper function to draw rounded rectangles
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
  ctx.fill();
}
```

### SVG Waveform Alternative

For simpler implementations, you can use SVG:

```typescript
import React, { useState, useEffect } from 'react';

interface SVGWaveformProps {
  conversation: any;
  isActive: boolean;
  bars?: number;
  color?: string;
  width?: number;
  height?: number;
}

export function SVGWaveform({
  conversation,
  isActive,
  bars = 20,
  color = '#3b82f6',
  width = 200,
  height = 40
}: SVGWaveformProps) {
  const [barHeights, setBarHeights] = useState<number[]>([]);

  useEffect(() => {
    if (!isActive) {
      setBarHeights([]);
      return;
    }

    const interval = setInterval(() => {
      const frequencyData = conversation.getOutputByteFrequencyData?.();
      
      if (frequencyData) {
        const heights = Array.from({ length: bars }, (_, i) => {
          const dataIndex = Math.floor((i / bars) * frequencyData.length);
          return (frequencyData[dataIndex] || 0) / 255;
        });
        setBarHeights(heights);
      } else {
        // Fallback random animation
        const heights = Array.from({ length: bars }, () => Math.random());
        setBarHeights(heights);
      }
    }, 50); // 20fps

    return () => clearInterval(interval);
  }, [isActive, conversation, bars]);

  if (!isActive) {
    return (
      <svg width={width} height={height} className="waveform-inactive">
        <rect width="100%" height="2" y={height/2 - 1} fill={color} opacity={0.3} rx="1"/>
      </svg>
    );
  }

  const barWidth = (width - (bars - 1) * 2) / bars; // 2px gaps

  return (
    <svg width={width} height={height} className="waveform-active">
      {barHeights.map((heightRatio, index) => (
        <rect
          key={index}
          x={index * (barWidth + 2)}
          y={height/2 - (heightRatio * height * 0.4)}
          width={barWidth}
          height={heightRatio * height * 0.8}
          fill={color}
          rx="1"
          className="waveform-bar"
        >
          <animate
            attributeName="height"
            dur="0.1s"
            repeatCount="1"
            fill="freeze"
          />
        </rect>
      ))}
    </svg>
  );
}
```

## Volume Level Indicator

Simple volume meter for showing speaking activity:

```typescript
interface VolumeMeterProps {
  conversation: any;
  type: 'input' | 'output'; // User mic or AI voice
  size?: number;
}

export function VolumeMeter({ conversation, type, size = 50 }: VolumeMeterProps) {
  const [volume, setVolume] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const currentVolume = type === 'input' 
        ? conversation.getInputVolume?.() || 0
        : conversation.getOutputVolume?.() || 0;
      
      setVolume(currentVolume);
    }, 50);

    return () => clearInterval(interval);
  }, [conversation, type]);

  const intensity = Math.min(volume * 2, 1); // Boost sensitivity

  return (
    <div 
      className={`volume-meter ${type}`}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: `radial-gradient(circle, 
          rgba(59, 130, 246, ${0.3 + intensity * 0.7}) 0%, 
          rgba(59, 130, 246, 0.1) 70%,
          transparent 100%
        )`,
        transform: `scale(${1 + intensity * 0.2})`,
        transition: 'transform 0.1s ease'
      }}
    >
      <div className="volume-indicator" style={{
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        border: `2px solid rgba(59, 130, 246, ${intensity})`,
        boxSizing: 'border-box'
      }} />
    </div>
  );
}
```

## Recommended Libraries

For more advanced visualizations, consider these React-compatible libraries:

### 1. react-audio-visualize
```bash
npm install react-audio-visualize
```

```typescript
import { AudioVisualizer } from 'react-audio-visualize';

// Note: This library typically works with MediaRecorder
// You'd need to adapt it to work with ElevenLabs frequency data
```

### 2. react-voice-visualizer
```bash
npm install react-voice-visualizer
```

```typescript
import { VoiceVisualizer } from 'react-voice-visualizer';

export function CustomVoiceVisualizer({ conversation, isActive }) {
  return (
    <VoiceVisualizer
      isActive={isActive}
      barWidth={2}
      gap={1}
      rounded={2}
      mainBarColor="#3b82f6"
      secondaryBarColor="#94a3b8"
      speed={6}
      controls={false}
      // Adapt to use ElevenLabs audio data
      customAnalyser={() => conversation.getOutputByteFrequencyData?.()}
    />
  );
}
```

### 3. Custom Canvas Solution (Recommended)

For full control over the animation, create a custom component:

```typescript
import { useCallback, useRef, useEffect } from 'react';

interface CustomWaveformProps {
  conversation: any;
  isActive: boolean;
}

export function CustomWaveform({ conversation, isActive }: CustomWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    const centerY = height / 2;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    if (isActive) {
      const frequencyData = conversation.getOutputByteFrequencyData?.();
      
      if (frequencyData) {
        // Draw frequency bars
        const barCount = 30;
        const barWidth = width / barCount;
        
        ctx.fillStyle = '#3b82f6';
        
        for (let i = 0; i < barCount; i++) {
          const dataIndex = Math.floor((i / barCount) * frequencyData.length);
          const amplitude = frequencyData[dataIndex] / 255;
          const barHeight = amplitude * height * 0.8;
          
          ctx.fillRect(
            i * barWidth + 1,
            centerY - barHeight / 2,
            barWidth - 2,
            barHeight
          );
        }
      }
    } else {
      // Draw flat line when inactive
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(width, centerY);
      ctx.stroke();
    }

    animationRef.current = requestAnimationFrame(draw);
  }, [conversation, isActive]);

  useEffect(() => {
    draw();
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      width={300}
      height={60}
      className="custom-waveform"
      style={{ width: '100%', height: 'auto' }}
    />
  );
}
```

## Phone Interface Integration

Complete implementation for your phone-like interface:

```typescript
import { WaveformVisualizer } from './WaveformVisualizer';
import { VolumeMeter } from './VolumeMeter';

export function PhoneTrainingInterface({ conversation, personaData }) {
  return (
    <div className="phone-interface">
      {/* Avatar Section */}
      <div className="avatar-section">
        <div className="avatar-container">
          {/* Persona Avatar */}
          <div className="seller-avatar">
            <img 
              src={personaData.avatar_url || '/default-seller.png'} 
              alt={personaData.name}
            />
            
            {/* Volume indicator around avatar */}
            {conversation.isSpeaking && (
              <VolumeMeter 
                conversation={conversation}
                type="output"
                size={120}
              />
            )}
          </div>
          
          {/* Persona Info */}
          <div className="persona-info">
            <h3>{personaData.name}</h3>
            <p>{personaData.property_type} in {personaData.location}</p>
          </div>
        </div>

        {/* Waveform Animation */}
        <div className="waveform-section">
          <WaveformVisualizer
            conversation={conversation}
            isActive={conversation.isSpeaking}
            width={280}
            height={50}
            color="#10b981" // Green for AI speaking
          />
          
          {/* User speaking indicator */}
          {!conversation.isSpeaking && (
            <VolumeMeter 
              conversation={conversation}
              type="input"
              size={30}
            />
          )}
        </div>
      </div>
    </div>
  );
}
```

## CSS Styling

```css
.phone-interface {
  max-width: 400px;
  margin: 0 auto;
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.avatar-section {
  padding: 2rem;
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.avatar-container {
  position: relative;
  margin-bottom: 1rem;
}

.seller-avatar {
  position: relative;
  display: inline-block;
}

.seller-avatar img {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 3px solid white;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.waveform-section {
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.waveform-container {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 0.5rem;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.waveform-container.active {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

.volume-meter {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.volume-meter.output {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
}

.volume-meter.input {
  opacity: 0.7;
}

/* Phone-like animations */
@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.1); opacity: 1; }
}

.avatar-container.speaking {
  animation: pulse 2s infinite ease-in-out;
}

/* Waveform animations */
.waveform-bar {
  transition: height 0.1s ease;
}

.custom-waveform {
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
}
```

## Performance Considerations

1. **Frame Rate**: Limit animation to 30-60fps for smooth performance
2. **Data Sampling**: Don't use all frequency data points; sample every nth value
3. **Memory Management**: Clean up animations on component unmount
4. **Battery Usage**: Consider reducing animation when app is not in focus

```typescript
// Optimize performance
useEffect(() => {
  let rafId: number;
  
  const animate = () => {
    if (document.hidden) {
      // Skip animation when tab is not visible
      rafId = requestAnimationFrame(animate);
      return;
    }
    
    // Your animation logic here
    drawWaveform();
    
    rafId = requestAnimationFrame(animate);
  };
  
  if (isActive) {
    animate();
  }
  
  return () => {
    if (rafId) {
      cancelAnimationFrame(rafId);
    }
  };
}, [isActive]);
```

This implementation provides a complete audio visualization solution tailored to your phone-like training interface, with real-time waveform animations that respond to the AI's speech patterns.