"use client"
import { useEffect, useState, useRef } from "react"
import type { VhsIntensity } from "@/app/page"

interface VhsEffectsProps {
  intensity: VhsIntensity
}

const intensityConfig = {
  soft: {
    scanlineOpacity: 0.03,
    scanlineGap: 3,
    noiseOpacity: 0.01,
    flickerIntensity: 0.01,
    glitchFrequency: 0.001,
    vignette: 0.35,
    phosphorGlow: 0.02,
    curvature: 0.015,
    screenDirt: 0.02,
  },
  normal: {
    scanlineOpacity: 0.05,
    scanlineGap: 2,
    noiseOpacity: 0.02,
    flickerIntensity: 0.02,
    glitchFrequency: 0.005,
    vignette: 0.5,
    phosphorGlow: 0.03,
    curvature: 0.02,
    screenDirt: 0.03,
  },
  strong: {
    scanlineOpacity: 0.08,
    scanlineGap: 2,
    noiseOpacity: 0.04,
    flickerIntensity: 0.04,
    glitchFrequency: 0.015,
    vignette: 0.65,
    phosphorGlow: 0.05,
    curvature: 0.025,
    screenDirt: 0.05,
  },
  extreme: {
    scanlineOpacity: 0.12,
    scanlineGap: 2,
    noiseOpacity: 0.08,
    flickerIntensity: 0.08,
    glitchFrequency: 0.04,
    vignette: 0.8,
    phosphorGlow: 0.08,
    curvature: 0.03,
    screenDirt: 0.08,
  },
}

export default function VhsEffects({ intensity }: VhsEffectsProps) {
  const config = intensityConfig[intensity]
  const [glitchLines, setGlitchLines] = useState<
    Array<{ id: number; top: number; height: number; opacity: number; blur: number }>
  >([])
  const [screenFlicker, setScreenFlicker] = useState(1)
  const noiseCanvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = noiseCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = 128
    canvas.height = 128

    let animationId: number
    const drawNoise = () => {
      const imageData = ctx.createImageData(128, 128)
      for (let i = 0; i < imageData.data.length; i += 4) {
        // Ruido mas suave con menos contraste
        const value = 128 + (Math.random() - 0.5) * 60
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
      if (Math.random() < config.glitchFrequency) {
        const newLines = Array.from({ length: 1 + Math.floor(Math.random() * 2) }, (_, i) => ({
          id: Date.now() + i,
          top: Math.random() * 100,
          height: 0.3 + Math.random() * 1.5,
          opacity: 0.03 + Math.random() * 0.06,
          blur: 1 + Math.random() * 2,
        }))

        setGlitchLines(newLines)

        setTimeout(
          () => {
            setGlitchLines([])
          },
          60 + Math.random() * 100,
        )
      }
    }

    // Flicker muy sutil
    const flickerInterval = setInterval(() => {
      if (Math.random() < config.flickerIntensity) {
        setScreenFlicker(0.97 + Math.random() * 0.03)
        setTimeout(() => setScreenFlicker(1), 30 + Math.random() * 50)
      }
    }, 100)

    const glitchInterval = setInterval(createGlitchLines, 200)

    return () => {
      clearInterval(glitchInterval)
      clearInterval(flickerInterval)
    }
  }, [config.glitchFrequency, config.flickerIntensity])

  return (
    <div
      className="absolute inset-0 pointer-events-none z-40 overflow-hidden"
      style={{ opacity: screenFlicker, transition: "opacity 0.03s ease-out" }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: `repeating-linear-gradient(
            0deg,
            transparent 0px,
            transparent ${config.scanlineGap}px,
            rgba(0, 0, 0, ${config.scanlineOpacity}) ${config.scanlineGap}px,
            rgba(0, 0, 0, ${config.scanlineOpacity * 0.7}) ${config.scanlineGap + 1}px
          )`,
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 120% 120% at 50% 50%, 
              transparent 0%, 
              transparent 50%,
              rgba(0,0,0,${config.vignette * 0.3}) 70%,
              rgba(0,0,0,${config.vignette * 0.6}) 85%,
              rgba(0,0,0,${config.vignette}) 100%
            )
          `,
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          boxShadow: `
            inset ${config.curvature * 1000}px 0 ${config.curvature * 2000}px rgba(0,0,0,0.15),
            inset -${config.curvature * 1000}px 0 ${config.curvature * 2000}px rgba(0,0,0,0.15),
            inset 0 ${config.curvature * 800}px ${config.curvature * 1500}px rgba(0,0,0,0.1),
            inset 0 -${config.curvature * 800}px ${config.curvature * 1500}px rgba(0,0,0,0.1)
          `,
        }}
      />

      {/* Ruido de pantalla suave */}
      <canvas
        ref={noiseCanvasRef}
        className="absolute inset-0 w-full h-full"
        style={{
          opacity: config.noiseOpacity,
          mixBlendMode: "overlay",
          imageRendering: "auto",
          filter: "blur(0.5px)",
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at center, 
            rgba(255,255,255,${config.phosphorGlow}) 0%, 
            transparent 60%
          )`,
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
              rgba(255,255,255,${line.opacity * 0.5}) 20%, 
              rgba(255,255,255,${line.opacity}) 50%, 
              rgba(255,255,255,${line.opacity * 0.5}) 80%, 
              transparent 100%
            )`,
            filter: `blur(${line.blur}px)`,
            animation: "glitchSlide 0.08s ease-out",
          }}
        />
      ))}

      <div
        className="absolute left-0 right-0"
        style={{
          height: "8%",
          background: `linear-gradient(180deg, 
            transparent 0%,
            rgba(255,255,255,0.015) 30%,
            rgba(255,255,255,0.025) 50%,
            rgba(255,255,255,0.015) 70%,
            transparent 100%
          )`,
          animation: "trackingBarSlow 12s linear infinite",
          filter: "blur(2px)",
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at 15% 25%, rgba(255,255,255,${config.screenDirt * 0.3}) 0%, transparent 3%),
            radial-gradient(circle at 85% 75%, rgba(255,255,255,${config.screenDirt * 0.2}) 0%, transparent 2%),
            radial-gradient(circle at 70% 20%, rgba(255,255,255,${config.screenDirt * 0.15}) 0%, transparent 1.5%)
          `,
          opacity: 0.5,
        }}
      />

      <div
        className="absolute top-0 left-0 right-0 h-1/3"
        style={{
          background: "linear-gradient(180deg, rgba(255,255,255,0.02) 0%, transparent 100%)",
          borderRadius: "50% 50% 0 0 / 20% 20% 0 0",
        }}
      />

      {/* Efectos adicionales para modo extremo */}
      {intensity === "extreme" && (
        <>
          {/* Rolling vertical ocasional */}
          <div
            className="absolute inset-0"
            style={{
              background: `repeating-linear-gradient(
                0deg,
                transparent 0%,
                rgba(0,0,0,0.03) 48%,
                rgba(255,255,255,0.02) 50%,
                rgba(0,0,0,0.03) 52%,
                transparent 100%
              )`,
              backgroundSize: "100% 200%",
              animation: "verticalRoll 8s linear infinite",
            }}
          />
          {/* Aberracion cromatica muy sutil en bordes */}
          <div
            className="absolute inset-0"
            style={{
              boxShadow: `
                inset 2px 0 3px rgba(255,200,200,0.03),
                inset -2px 0 3px rgba(200,200,255,0.03)
              `,
            }}
          />
        </>
      )}

      <style jsx>{`
        @keyframes glitchSlide {
          0% { transform: translateX(-5px); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateX(5px); opacity: 0; }
        }
        @keyframes trackingBarSlow {
          0% { top: -10%; }
          100% { top: 110%; }
        }
        @keyframes verticalRoll {
          0% { background-position: 0 0; }
          100% { background-position: 0 200%; }
        }
      `}</style>
    </div>
  )
}
