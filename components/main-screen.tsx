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
  const [effectsEnabled, setEffectsEnabled] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 })

  useEffect(() => {
    if (tvTurnedOn) {
      setTvAnimation("turning-on")
      setTimeout(() => {
        setTvAnimation("on")
        setTimeout(() => {
          setEffectsEnabled(true)
          setContentVisible(true)
        }, 500)
      }, 2800)
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

  const parallaxX = (mousePosition.x - 0.5) * 15
  const parallaxY = (mousePosition.y - 0.5) * 10

  return (
    <div className="relative w-full h-full overflow-hidden bg-black">
      {/* Fondo negro base que siempre esta presente */}
      <div className="absolute inset-0 bg-black z-0" />

      {/* Animacion de encendido - siempre encima de todo con z-50 */}
      {tvAnimation === "turning-on" && <TvTurnOnAnimation />}

      {/* Contenido principal - solo se muestra cuando tvAnimation === "on" */}
      {tvAnimation === "on" && (
        <>
          {/* Imagen de fondo con parallax */}
          <div
            className="absolute inset-0 z-10 transition-all duration-500 ease-out"
            style={{
              backgroundImage: `url('${backgroundImage}')`,
              backgroundSize: "contain",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              backgroundColor: "black",
              transform: `translate(${parallaxX}px, ${parallaxY}px)`,
              opacity: contentVisible ? 1 : 0,
            }}
          />

          {/* Vignette */}
          <div
            className="absolute inset-0 z-20 transition-opacity duration-1000"
            style={{
              background:
                "radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.4) 70%, rgba(0,0,0,0.8) 100%)",
              opacity: contentVisible ? 1 : 0,
            }}
          />

          {/* UI Content */}
          <div
            className="relative z-30 w-full h-full flex flex-col transition-opacity duration-700"
            style={{ opacity: contentVisible ? 1 : 0 }}
          >
            {/* Botones y contenido */}
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

          {/* VHS Effects - solo cuando effectsEnabled es true */}
          {effectsEnabled && <VhsEffects intensity={vhsIntensity} />}
        </>
      )}
    </div>
  )
}

function TvTurnOnAnimation() {
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    const phases = [
      50, // 1: Punto inicial
      200, // 2: Punto pulsa
      400, // 3: Linea horizontal inicial
      600, // 4: Linea se expande
      900, // 5: Linea completa con glow
      1200, // 6: Primeros flickers verticales
      1500, // 7: Expansion vertical comienza
      1800, // 8: Expansion vertical media
      2100, // 9: Casi completo con interferencia
      2400, // 10: Pantalla llena
      2600, // 11: Flash final
      2800, // 12: Fade out
    ]
    phases.forEach((delay, index) => {
      setTimeout(() => setPhase(index + 1), delay)
    })
  }, [])

  return (
    <div className="absolute inset-0 z-50 pointer-events-none overflow-hidden">
      {/* Fondo negro base */}
      <div className="absolute inset-0 bg-black" />

      {/* Fase 1-2: Punto central pulsante */}
      {phase >= 1 && phase <= 4 && (
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"
          style={{
            width: phase === 1 ? "3px" : phase === 2 ? "6px" : "4px",
            height: phase === 1 ? "3px" : phase === 2 ? "6px" : "4px",
            boxShadow: `
              0 0 ${10 + phase * 5}px ${2 + phase * 2}px rgba(255,255,255,0.9),
              0 0 ${20 + phase * 10}px ${5 + phase * 3}px rgba(200,220,255,0.6),
              0 0 ${30 + phase * 15}px ${8 + phase * 4}px rgba(150,180,255,0.3)
            `,
            animation: phase === 2 ? "tvPulse 0.1s ease-in-out infinite" : "none",
          }}
        />
      )}

      {/* Fase 3-5: Linea horizontal expandiendose */}
      {phase >= 3 && phase <= 6 && (
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white"
          style={{
            width: phase === 3 ? "15%" : phase === 4 ? "45%" : phase === 5 ? "80%" : "100%",
            height: phase <= 4 ? "2px" : "3px",
            borderRadius: "2px",
            boxShadow: `
              0 0 15px 3px rgba(255,255,255,0.9),
              0 0 30px 8px rgba(200,220,255,0.6),
              0 0 60px 15px rgba(150,180,255,0.3),
              inset 0 0 10px 2px rgba(255,255,255,0.8)
            `,
            transition: "all 0.2s ease-out",
          }}
        />
      )}

      {/* Fase 6: Flickers/interferencia antes de expansion */}
      {phase === 6 && (
        <>
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute left-0 right-0 bg-white/20"
              style={{
                height: `${Math.random() * 3 + 1}px`,
                top: `${Math.random() * 100}%`,
                animation: `tvFlicker ${0.05 + Math.random() * 0.1}s steps(2) infinite`,
                animationDelay: `${Math.random() * 0.1}s`,
              }}
            />
          ))}
        </>
      )}

      {/* Fase 7-10: Expansion vertical con efecto CRT real */}
      {phase >= 7 && phase <= 10 && (
        <div
          className="absolute left-0 right-0 top-1/2 bg-white overflow-hidden"
          style={{
            height: phase === 7 ? "8%" : phase === 8 ? "30%" : phase === 9 ? "70%" : "100%",
            transform: "translateY(-50%)",
            transition: "height 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
            boxShadow: `
              0 0 40px 10px rgba(255,255,255,0.5),
              inset 0 0 100px 20px rgba(200,220,255,0.3)
            `,
          }}
        >
          {/* Lineas de escaneo durante expansion */}
          <div
            className="absolute inset-0"
            style={{
              background: `repeating-linear-gradient(
                0deg,
                transparent,
                transparent 2px,
                rgba(0,0,0,0.1) 2px,
                rgba(0,0,0,0.1) 4px
              )`,
            }}
          />

          {/* Interferencia horizontal */}
          {phase >= 8 && (
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(
                  90deg,
                  transparent 0%,
                  rgba(0,0,0,0.05) 25%,
                  transparent 50%,
                  rgba(0,0,0,0.05) 75%,
                  transparent 100%
                )`,
                animation: "tvHorizontalNoise 0.1s steps(3) infinite",
              }}
            />
          )}

          {/* Distorsion de onda */}
          {phase === 9 && (
            <>
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="absolute left-0 right-0 bg-black/10"
                  style={{
                    height: "2px",
                    top: `${20 + i * 15}%`,
                    animation: `tvWaveDistortion 0.15s ease-in-out infinite`,
                    animationDelay: `${i * 0.03}s`,
                  }}
                />
              ))}
            </>
          )}
        </div>
      )}

      {/* Fase 11: Flash brillante final */}
      {phase === 11 && (
        <div
          className="absolute inset-0 bg-white"
          style={{
            animation: "tvFinalFlash 0.2s ease-out forwards",
            boxShadow: "inset 0 0 100px 50px rgba(200,220,255,0.5)",
          }}
        />
      )}

      {/* Fase 12: Fade out suave */}
      {phase === 12 && (
        <div
          className="absolute inset-0 bg-white"
          style={{
            animation: "tvFadeOut 0.4s ease-out forwards",
          }}
        />
      )}

      {/* Borde CRT con efecto de curvatura durante toda la animacion */}
      {phase >= 3 && phase <= 11 && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            boxShadow: `
              inset 0 0 100px 40px rgba(0,0,0,0.5),
              inset 0 0 200px 80px rgba(0,0,0,0.3)
            `,
            borderRadius: "5%",
          }}
        />
      )}

      {/* Reflejo del tubo CRT */}
      {phase >= 5 && phase <= 10 && (
        <div
          className="absolute top-0 left-0 right-0 h-1/3 pointer-events-none"
          style={{
            background: "linear-gradient(to bottom, rgba(255,255,255,0.1) 0%, transparent 100%)",
            opacity: 0.5,
          }}
        />
      )}

      {/* Ruido estatico sutil */}
      {phase >= 6 && phase <= 10 && (
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            animation: "tvStaticNoise 0.1s steps(5) infinite",
          }}
        />
      )}

      <style jsx>{`
        @keyframes tvPulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          50% { transform: translate(-50%, -50%) scale(1.5); opacity: 0.8; }
        }
        @keyframes tvFlicker {
          0%, 100% { opacity: 0; }
          50% { opacity: 0.5; }
        }
        @keyframes tvHorizontalNoise {
          0% { transform: translateX(-10%); }
          33% { transform: translateX(5%); }
          66% { transform: translateX(-5%); }
          100% { transform: translateX(10%); }
        }
        @keyframes tvWaveDistortion {
          0%, 100% { transform: scaleY(1) translateX(0); }
          50% { transform: scaleY(2) translateX(3px); }
        }
        @keyframes tvFinalFlash {
          0% { opacity: 1; filter: brightness(1.5); }
          50% { opacity: 1; filter: brightness(2); }
          100% { opacity: 0.9; filter: brightness(1); }
        }
        @keyframes tvFadeOut {
          0% { opacity: 0.9; }
          100% { opacity: 0; }
        }
        @keyframes tvStaticNoise {
          0% { transform: translate(0, 0); }
          25% { transform: translate(-2%, 2%); }
          50% { transform: translate(2%, -2%); }
          75% { transform: translate(-2%, -2%); }
          100% { transform: translate(2%, 2%); }
        }
      `}</style>
    </div>
  )
}
