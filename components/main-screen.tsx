"use client"

import { useState, useEffect, useRef } from "react"
import { Settings, Volume2, VolumeX, Loader2 } from "lucide-react"
import type { VhsIntensity } from "@/app/page"
import VhsEffects from "./vhs-effects"

interface MainScreenProps {
  tvTurnedOn: boolean
  vhsIntensity: VhsIntensity
  backgroundImage: string
  onSettingsClick: () => void
  onProjectRivalsClick: () => void
  isConnecting?: boolean
  serverName?: string
}

export default function MainScreen({
  tvTurnedOn,
  vhsIntensity,
  backgroundImage,
  onSettingsClick,
  onProjectRivalsClick,
  isConnecting = false,
  serverName = "Project Rivals",
}: MainScreenProps) {
  const [tvAnimation, setTvAnimation] = useState<"off" | "turning-on" | "on">("off")
  const [contentVisible, setContentVisible] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 })

  useEffect(() => {
    if (tvTurnedOn) {
      setTvAnimation("turning-on")
      setTimeout(() => {
        setTvAnimation("on")
        setTimeout(() => setContentVisible(true), 300)
      }, 1500)
    }
  }, [tvTurnedOn])

  useEffect(() => {
    if (tvAnimation === "on" && !audioRef.current) {
      audioRef.current = new Audio("https://assets.mixkit.co/music/preview/mixkit-sleepy-cat-135.mp3")
      audioRef.current.loop = true
      audioRef.current.volume = 0.15
      audioRef.current.play().catch(() => {})
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [tvAnimation])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted
    }
  }, [isMuted])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX / window.innerWidth
      const y = e.clientY / window.innerHeight
      setMousePosition({ x, y })
    }

    const handleDeviceOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma !== null && e.beta !== null) {
        const x = (e.gamma + 45) / 90
        const y = (e.beta + 45) / 90
        setMousePosition({ x: Math.max(0, Math.min(1, x)), y: Math.max(0, Math.min(1, y)) })
      }
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("deviceorientation", handleDeviceOrientation)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("deviceorientation", handleDeviceOrientation)
    }
  }, [])

  const parallaxX = (mousePosition.x - 0.5) * 30
  const parallaxY = (mousePosition.y - 0.5) * 20

  return (
    <div className="relative w-full h-full overflow-hidden">
      <div
        className="absolute inset-[-50px] bg-contain bg-center bg-no-repeat transition-all duration-300 ease-out"
        style={{
          backgroundImage: `url('${backgroundImage}')`,
          backgroundSize: "cover",
          filter: tvAnimation === "on" ? "none" : "brightness(0)",
          transform: tvAnimation === "on" ? `scale(1.05) translate(${parallaxX}px, ${parallaxY}px)` : "scale(1.1)",
        }}
      />

      <div className="absolute inset-0 -z-10 bg-black" />

      <div
        className="absolute inset-0 transition-opacity duration-1000"
        style={{
          background:
            tvAnimation === "on"
              ? "radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.4) 70%, rgba(0,0,0,0.8) 100%)"
              : "black",
        }}
      />

      {tvAnimation === "turning-on" && <TvTurnOnAnimation />}

      {tvAnimation === "on" && (
        <div
          className="relative z-10 w-full h-full flex flex-col transition-opacity duration-700"
          style={{ opacity: contentVisible ? 1 : 0 }}
        >
          <div className="absolute top-4 right-4 md:top-6 md:right-6 flex gap-2 md:gap-3">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 md:p-3 bg-black/50 backdrop-blur-sm border border-white/10 rounded-lg hover:bg-white/10 hover:border-white/20 transition-all duration-300 group"
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 md:w-5 md:h-5 text-white/60 group-hover:text-white transition-colors" />
              ) : (
                <Volume2 className="w-4 h-4 md:w-5 md:h-5 text-white/60 group-hover:text-white transition-colors" />
              )}
            </button>
            <button
              onClick={onSettingsClick}
              className="p-2 md:p-3 bg-black/50 backdrop-blur-sm border border-white/10 rounded-lg hover:bg-white/10 hover:border-white/20 transition-all duration-300 group"
            >
              <Settings className="w-4 h-4 md:w-5 md:h-5 text-white/60 group-hover:text-white group-hover:rotate-90 transition-all duration-500" />
            </button>
          </div>

          <div className="flex-1" />

          <div className="flex flex-col items-center pb-8 md:pb-16">
            <p
              className="text-white/40 text-[10px] md:text-xs uppercase tracking-[0.4em] md:tracking-[0.5em] mb-2 md:mb-3 font-mono"
              style={{
                textShadow: "0 0 15px rgba(255,255,255,0.2), 0 0 30px rgba(255,255,255,0.1)",
                fontFamily: "'Courier New', monospace",
                fontWeight: 300,
              }}
            >
              ▸ Entrar a ◂
            </p>

            <button
              onClick={onProjectRivalsClick}
              disabled={isConnecting}
              className={`relative group mb-6 md:mb-8 transform transition-all duration-300 ${
                isConnecting ? "cursor-wait scale-95" : "cursor-pointer hover:scale-105"
              }`}
            >
              <div
                className={`absolute -inset-1 rounded-lg blur-md transition-opacity duration-500 ${
                  isConnecting
                    ? "bg-green-500/30 opacity-100 animate-pulse"
                    : "bg-white/10 opacity-0 group-hover:opacity-100"
                }`}
              />

              <div
                className={`relative px-4 md:px-6 py-2 md:py-2.5 backdrop-blur-sm border rounded-md overflow-hidden transition-all duration-300 ${
                  isConnecting
                    ? "bg-green-900/60 border-green-500/50"
                    : "bg-black/60 border-white/30 group-hover:border-white/60 group-hover:bg-black/40"
                }`}
              >
                <span
                  className={`relative text-xs md:text-sm font-medium tracking-[0.15em] md:tracking-[0.2em] uppercase font-mono transition-colors flex items-center gap-2 ${
                    isConnecting ? "text-green-400" : "text-white/90 group-hover:text-white"
                  }`}
                  style={{
                    textShadow: isConnecting ? "0 0 12px rgba(74,222,128,0.6)" : "0 0 8px rgba(255,255,255,0.4)",
                  }}
                >
                  {isConnecting && <Loader2 className="w-3 h-3 md:w-4 md:h-4 animate-spin" />}
                  {isConnecting ? "Conectando..." : serverName}
                </span>
                {!isConnecting && (
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                )}
              </div>
            </button>

            <div className="w-full h-px relative">
              <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-white/40 to-white/5" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent blur-sm" />
            </div>
          </div>
        </div>
      )}

      {tvAnimation === "on" && <VhsEffects intensity={vhsIntensity} />}
    </div>
  )
}

function TvTurnOnAnimation() {
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    const phases = [100, 250, 400, 600, 900, 1200]
    phases.forEach((delay, index) => {
      setTimeout(() => setPhase(index + 1), delay)
    })
  }, [])

  return (
    <div className="absolute inset-0 z-50 pointer-events-none">
      {phase >= 1 && phase < 5 && (
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full"
          style={{
            width: phase === 1 ? "4px" : phase === 2 ? "40%" : phase === 3 ? "70%" : "100%",
            height: phase === 1 ? "4px" : phase === 2 ? "2px" : phase === 3 ? "3px" : "4px",
            boxShadow: `0 0 ${20 + phase * 10}px ${5 + phase * 3}px rgba(255,255,255,0.9)`,
            transition: "all 0.15s ease-out",
          }}
        />
      )}

      {phase >= 5 && (
        <div
          className="absolute inset-0 bg-white"
          style={{
            animation: "tvExpand 0.35s ease-out forwards",
          }}
        />
      )}

      {phase >= 6 && (
        <div
          className="absolute inset-0 bg-white"
          style={{
            animation: "fadeOut 0.4s ease-out forwards",
          }}
        />
      )}

      <style jsx>{`
        @keyframes tvExpand {
          0% { 
            clip-path: inset(49.5% 0 49.5% 0);
            opacity: 1;
          }
          100% { 
            clip-path: inset(0 0 0 0);
            opacity: 1;
          }
        }
        @keyframes fadeOut {
          0% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  )
}
