"use client"
import { useEffect, useState, useRef } from "react"
import type { VhsIntensity } from "@/app/page"

interface VhsEffectsProps {
  intensity: VhsIntensity
}

const intensityConfig = {
  soft: {
    scanlineOpacity: 0.04,
    noiseOpacity: 0.015,
    distortionStrength: 0.2,
    flickerIntensity: 0.015,
    glitchFrequency: 0.002,
    vignette: 0.4,
    blur: 0,
    scanlineSpeed: 12,
    trackingSpeed: 15,
  },
  normal: {
    scanlineOpacity: 0.07,
    noiseOpacity: 0.03,
    distortionStrength: 0.5,
    flickerIntensity: 0.03,
    glitchFrequency: 0.008,
    vignette: 0.55,
    blur: 0.2,
    scanlineSpeed: 8,
    trackingSpeed: 10,
  },
  strong: {
    scanlineOpacity: 0.12,
    noiseOpacity: 0.06,
    distortionStrength: 1,
    flickerIntensity: 0.06,
    glitchFrequency: 0.03,
    vignette: 0.7,
    blur: 0.4,
    scanlineSpeed: 5,
    trackingSpeed: 6,
  },
  extreme: {
    scanlineOpacity: 0.2,
    noiseOpacity: 0.12,
    distortionStrength: 2,
    flickerIntensity: 0.12,
    glitchFrequency: 0.1,
    vignette: 0.85,
    blur: 0.8,
    scanlineSpeed: 3,
    trackingSpeed: 4,
  },
}

export default function VhsEffects({ intensity }: VhsEffectsProps) {
  const config = intensityConfig[intensity]
  const [glitchLines, setGlitchLines] = useState<
    Array<{ id: number; top: number; height: number; opacity: number; offset: number }>
  >([])
  const [horizontalGlitch, setHorizontalGlitch] = useState(0)
  const [verticalRoll, setVerticalRoll] = useState(0)
  const noiseCanvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    // Animated noise canvas
    const canvas = noiseCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = 256
    canvas.height = 256

    let animationId: number
    const drawNoise = () => {
      const imageData = ctx.createImageData(256, 256)
      for (let i = 0; i < imageData.data.length; i += 4) {
        const value = Math.random() * 255
        imageData.data[i] = value
        imageData.data[i + 1] = value
        imageData.data[i + 2] = value
        imageData.data[i + 3] = 255
      }
      ctx.putImageData(imageData, 0, 0)
      animationId = requestAnimationFrame(drawNoise)
    }
    drawNoise()

    return () => cancelAnimationFrame(animationId)
  }, [])

  useEffect(() => {
    const createGlitchLines = () => {
      if (Math.random() < config.glitchFrequency * 5) {
        const numLines = 1 + Math.floor(Math.random() * 3)
        const newLines = Array.from({ length: numLines }, (_, i) => ({
          id: Date.now() + i,
          top: Math.random() * 100,
          height: 0.5 + Math.random() * 2,
          opacity: 0.05 + Math.random() * 0.1,
          offset: (Math.random() - 0.5) * 10,
        }))

        setGlitchLines(newLines)
        setHorizontalGlitch((Math.random() - 0.5) * config.distortionStrength * 5)

        setTimeout(
          () => {
            setGlitchLines([])
            setHorizontalGlitch(0)
          },
          80 + Math.random() * 120,
        )
      }
    }

    const glitchInterval = setInterval(createGlitchLines, 150)

    let rollInterval: NodeJS.Timeout | null = null
    if (intensity === "extreme") {
      rollInterval = setInterval(() => {
        if (Math.random() < 0.015) {
          let roll = 0
          const rollAnimation = setInterval(() => {
            roll += 1.5
            setVerticalRoll(roll)
            if (roll >= 15) {
              clearInterval(rollAnimation)
              setVerticalRoll(0)
            }
          }, 16)
        }
      }, 600)
    }

    return () => {
      clearInterval(glitchInterval)
      if (rollInterval) clearInterval(rollInterval)
    }
  }, [config.glitchFrequency, config.distortionStrength, intensity])

  return (
    <div
      className="absolute inset-0 pointer-events-none z-40 overflow-hidden"
      style={{
        transform: `translateX(${horizontalGlitch}px) translateY(${verticalRoll}px)`,
        transition: "transform 0.05s ease-out",
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: `repeating-linear-gradient(
            0deg,
            transparent 0px,
            transparent 1px,
            rgba(0, 0, 0, ${config.scanlineOpacity}) 1px,
            rgba(0, 0, 0, ${config.scanlineOpacity}) 2px
          )`,
          animation: `scanlineMove ${config.scanlineSpeed}s linear infinite`,
        }}
      />

      {/* CRT curved screen vignette */}
      <div
        className="absolute inset-0"
        style={{
          boxShadow: `
            inset 0 0 ${80 * config.vignette}px ${40 * config.vignette}px rgba(0,0,0,0.8),
            inset 0 0 ${150 * config.vignette}px ${60 * config.vignette}px rgba(0,0,0,0.5)
          `,
          borderRadius: "8px",
        }}
      />

      <canvas
        ref={noiseCanvasRef}
        className="absolute inset-0 w-full h-full mix-blend-overlay"
        style={{
          opacity: config.noiseOpacity,
          imageRendering: "pixelated",
        }}
      />

      {/* Subtle screen flicker */}
      <div
        className="absolute inset-0 bg-white/5 mix-blend-overlay"
        style={{
          animation: `flicker ${0.1 + Math.random() * 0.1}s steps(3) infinite`,
          opacity: config.flickerIntensity,
        }}
      />

      {glitchLines.map((line) => (
        <div
          key={line.id}
          className="absolute left-0 right-0"
          style={{
            top: `${line.top}%`,
            height: `${line.height}%`,
            background: `linear-gradient(90deg, 
              transparent 0%, 
              rgba(255,255,255,${line.opacity}) 10%, 
              rgba(255,255,255,${line.opacity * 0.7}) 50%, 
              rgba(255,255,255,${line.opacity}) 90%, 
              transparent 100%
            )`,
            transform: `translateX(${line.offset}px)`,
            filter: "blur(0.5px)",
          }}
        />
      ))}

      <div
        className="absolute left-0 right-0 overflow-hidden"
        style={{
          height: "15%",
          background: `linear-gradient(180deg, 
            transparent 0%,
            rgba(255,255,255,${0.02 * config.distortionStrength}) 20%,
            rgba(255,255,255,${0.04 * config.distortionStrength}) 50%,
            rgba(255,255,255,${0.02 * config.distortionStrength}) 80%,
            transparent 100%
          )`,
          animation: `trackingBar ${config.trackingSpeed}s linear infinite`,
        }}
      />

      {/* Subtle horizontal banding */}
      <div
        className="absolute inset-0"
        style={{
          background: `repeating-linear-gradient(
            0deg,
            transparent 0px,
            transparent 80px,
            rgba(255,255,255,${0.01 * config.distortionStrength}) 80px,
            rgba(255,255,255,${0.01 * config.distortionStrength}) 82px,
            transparent 82px,
            transparent 160px
          )`,
          animation: `slowDrift ${20 / config.distortionStrength}s linear infinite`,
        }}
      />

      {/* Extreme mode extra effects */}
      {intensity === "extreme" && (
        <>
          {/* Color fringing */}
          <div
            className="absolute inset-0 mix-blend-screen"
            style={{
              background: `linear-gradient(90deg, 
                rgba(255,255,255,0.03) 0%, 
                transparent 3%, 
                transparent 97%, 
                rgba(200,200,200,0.03) 100%
              )`,
              animation: "colorFringe 0.5s ease-in-out infinite alternate",
            }}
          />
          {/* Phosphor glow */}
          <div
            className="absolute inset-0"
            style={{
              background: "radial-gradient(ellipse at center, rgba(255,255,255,0.03) 0%, transparent 70%)",
              animation: "phosphorPulse 2s ease-in-out infinite",
            }}
          />
        </>
      )}

      <style jsx>{`
        @keyframes scanlineMove {
          0% { transform: translateY(0); }
          100% { transform: translateY(2px); }
        }
        @keyframes flicker {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }
        @keyframes trackingBar {
          0% { top: -20%; }
          100% { top: 120%; }
        }
        @keyframes slowDrift {
          0% { transform: translateY(0); }
          100% { transform: translateY(160px); }
        }
        @keyframes colorFringe {
          0% { transform: translateX(-1px); }
          100% { transform: translateX(1px); }
        }
        @keyframes phosphorPulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}
