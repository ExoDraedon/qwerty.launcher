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
  const tvOnSoundRef = useRef<HTMLAudioElement | null>(null)
  const staticSoundRef = useRef<HTMLAudioElement | null>(null)
  const humSoundRef = useRef<HTMLAudioElement | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 })

  useEffect(() => {
    if (tvTurnedOn) {
      setTvAnimation("turning-on")

      if (!isMuted) {
        // Sonido de encendido CRT
        tvOnSoundRef.current = new Audio("https://assets.mixkit.co/active_storage/sfx/209/209-preview.mp3")
        tvOnSoundRef.current.volume = 0.4
        tvOnSoundRef.current.play().catch(() => {})

        // Sonido de estatica suave
        staticSoundRef.current = new Audio("https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3")
        staticSoundRef.current.volume = 0.15
        staticSoundRef.current.loop = true
        setTimeout(() => {
          staticSoundRef.current?.play().catch(() => {})
        }, 300)
      }

      setTimeout(() => {
        setTvAnimation("on")

        if (staticSoundRef.current) {
          const fadeOut = setInterval(() => {
            if (staticSoundRef.current && staticSoundRef.current.volume > 0.02) {
              staticSoundRef.current.volume -= 0.02
            } else {
              clearInterval(fadeOut)
              staticSoundRef.current?.pause()
            }
          }, 50)
        }

        // Sonido de hum electrico de CRT
        if (!isMuted) {
          humSoundRef.current = new Audio("https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3")
          humSoundRef.current.volume = 0.05
          humSoundRef.current.loop = true
          humSoundRef.current.play().catch(() => {})
        }

        setTimeout(() => {
          setEffectsEnabled(true)
          setContentVisible(true)
        }, 500)
      }, 2800)
    }
  }, [tvTurnedOn, isMuted])

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
    if (humSoundRef.current) {
      humSoundRef.current.muted = isMuted
    }
    if (staticSoundRef.current) {
      staticSoundRef.current.muted = isMuted
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

  // Cleanup sonidos
  useEffect(() => {
    return () => {
      tvOnSoundRef.current?.pause()
      staticSoundRef.current?.pause()
      humSoundRef.current?.pause()
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
  const [staticNoise, setStaticNoise] = useState<number[]>([])

  useEffect(() => {
    // Generar ruido estatico aleatorio
    const noiseInterval = setInterval(() => {
      setStaticNoise(Array.from({ length: 50 }, () => Math.random()))
    }, 50)

    const phases = [
      50, // 1: Punto inicial
      150, // 2: Punto pulsa mas grande
      300, // 3: Punto brilla intenso
      500, // 4: Linea horizontal inicial
      750, // 5: Linea se expande con glow
      1000, // 6: Linea completa
      1200, // 7: Estatica aparece
      1500, // 8: Expansion vertical comienza
      1800, // 9: Expansion vertical media con rolling
      2100, // 10: Casi completo con interferencia
      2400, // 11: Pantalla llena con ajuste
      2600, // 12: Flash de sincronizacion
      2800, // 13: Fade out suave
    ]
    phases.forEach((delay, index) => {
      setTimeout(() => setPhase(index + 1), delay)
    })

    return () => clearInterval(noiseInterval)
  }, [])

  return (
    <div className="absolute inset-0 z-50 pointer-events-none overflow-hidden">
      {/* Fondo negro absoluto */}
      <div className="absolute inset-0 bg-black" />

      {/* Fase 1-3: Punto central con efecto de fosforo calentandose */}
      {phase >= 1 && phase <= 5 && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          {/* Glow exterior */}
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              width: phase <= 2 ? "30px" : "50px",
              height: phase <= 2 ? "30px" : "50px",
              background: "radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)",
              opacity: phase * 0.3,
              transition: "all 0.15s ease-out",
            }}
          />
          {/* Punto central */}
          <div
            className="rounded-full bg-white"
            style={{
              width: phase === 1 ? "2px" : phase === 2 ? "4px" : "3px",
              height: phase === 1 ? "2px" : phase === 2 ? "4px" : "3px",
              boxShadow: `
                0 0 ${5 + phase * 3}px ${2 + phase}px rgba(255,255,255,0.95),
                0 0 ${15 + phase * 5}px ${4 + phase * 2}px rgba(220,230,255,0.7),
                0 0 ${25 + phase * 8}px ${6 + phase * 3}px rgba(180,200,255,0.4)
              `,
              animation: phase === 2 ? "crtPointPulse 0.08s ease-in-out infinite" : "none",
              transition: "all 0.1s ease-out",
            }}
          />
        </div>
      )}

      {/* Fase 4-6: Linea horizontal expandiendose como CRT real */}
      {phase >= 4 && phase <= 7 && (
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: phase === 4 ? "8%" : phase === 5 ? "35%" : phase === 6 ? "70%" : "100%",
            height: phase <= 5 ? "2px" : "3px",
            background:
              "linear-gradient(90deg, rgba(200,210,255,0.5) 0%, rgba(255,255,255,1) 20%, rgba(255,255,255,1) 80%, rgba(200,210,255,0.5) 100%)",
            borderRadius: "2px",
            boxShadow: `
              0 0 10px 2px rgba(255,255,255,0.9),
              0 0 25px 5px rgba(200,220,255,0.7),
              0 0 50px 10px rgba(150,180,255,0.4),
              0 0 80px 20px rgba(100,140,255,0.2)
            `,
            transition: "width 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          }}
        />
      )}

      {/* Fase 7: Estatica/ruido antes de expansion vertical */}
      {phase === 7 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative" style={{ width: "100%", height: "6px", overflow: "hidden" }}>
            {staticNoise.slice(0, 20).map((n, i) => (
              <div
                key={i}
                className="absolute bg-white"
                style={{
                  left: `${i * 5}%`,
                  width: `${2 + n * 3}%`,
                  height: "100%",
                  opacity: 0.3 + n * 0.5,
                  filter: "blur(0.5px)",
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Fase 8-11: Expansion vertical con efecto rolling de CRT */}
      {phase >= 8 && phase <= 11 && (
        <div
          className="absolute left-0 right-0 top-1/2 overflow-hidden"
          style={{
            height: phase === 8 ? "10%" : phase === 9 ? "40%" : phase === 10 ? "80%" : "100%",
            transform: "translateY(-50%)",
            transition: "height 0.28s cubic-bezier(0.22, 0.61, 0.36, 1)",
          }}
        >
          {/* Gradiente de borde suave */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(180deg, 
                rgba(200,220,255,0.3) 0%, 
                rgba(255,255,255,0.95) 5%, 
                rgba(255,255,255,1) 50%, 
                rgba(255,255,255,0.95) 95%, 
                rgba(200,220,255,0.3) 100%
              )`,
            }}
          />

          {/* Lineas de escaneo */}
          <div
            className="absolute inset-0"
            style={{
              background: `repeating-linear-gradient(
                0deg,
                transparent 0px,
                transparent 2px,
                rgba(0,0,0,0.08) 2px,
                rgba(0,0,0,0.08) 4px
              )`,
              animation: "crtScanlines 0.1s steps(2) infinite",
            }}
          />

          {/* Efecto rolling/ondulacion */}
          {phase >= 9 && (
            <div
              className="absolute inset-0"
              style={{
                background: `repeating-linear-gradient(
                  0deg,
                  transparent 0%,
                  rgba(0,0,0,0.05) 25%,
                  transparent 50%
                )`,
                backgroundSize: "100% 60px",
                animation: "crtRolling 0.3s linear infinite",
              }}
            />
          )}

          {/* Distorsion horizontal sutil */}
          {phase >= 10 && (
            <>
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="absolute left-0 right-0"
                  style={{
                    top: `${25 + i * 25}%`,
                    height: "2px",
                    background: "rgba(0,0,0,0.1)",
                    transform: `translateX(${(staticNoise[i] || 0) * 4 - 2}px)`,
                    filter: "blur(0.5px)",
                  }}
                />
              ))}
            </>
          )}

          {/* Ruido estatico sutil */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
              animation: "crtNoise 0.05s steps(4) infinite",
            }}
          />
        </div>
      )}

      {/* Fase 12: Flash de sincronizacion */}
      {phase === 12 && (
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(255,255,255,1) 0%, rgba(220,230,255,0.9) 50%, rgba(180,200,255,0.7) 100%)",
            animation: "crtSyncFlash 0.2s ease-out forwards",
          }}
        />
      )}

      {/* Fase 13: Fade out */}
      {phase === 13 && (
        <div
          className="absolute inset-0 bg-white"
          style={{
            animation: "crtFadeOut 0.35s ease-out forwards",
          }}
        />
      )}

      {/* Borde de pantalla CRT curva - durante toda la animacion */}
      {phase >= 4 && phase <= 12 && (
        <>
          {/* Sombra interior */}
          <div
            className="absolute inset-0"
            style={{
              boxShadow: `
                inset 0 0 60px 25px rgba(0,0,0,0.6),
                inset 0 0 120px 50px rgba(0,0,0,0.3)
              `,
              borderRadius: "4%",
              pointerEvents: "none",
            }}
          />
          {/* Reflejo superior sutil */}
          <div
            className="absolute top-0 left-[10%] right-[10%] h-[20%]"
            style={{
              background: "linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 100%)",
              borderRadius: "50% 50% 0 0",
              opacity: phase >= 8 ? 0.6 : 0,
              transition: "opacity 0.3s ease-out",
            }}
          />
        </>
      )}

      <style jsx>{`
        @keyframes crtPointPulse {
          0%, 100% { transform: scale(1); filter: brightness(1); }
          50% { transform: scale(1.3); filter: brightness(1.3); }
        }
        @keyframes crtScanlines {
          0% { transform: translateY(0); }
          100% { transform: translateY(4px); }
        }
        @keyframes crtRolling {
          0% { transform: translateY(0); }
          100% { transform: translateY(60px); }
        }
        @keyframes crtNoise {
          0% { transform: translate(0, 0); }
          25% { transform: translate(-1%, 1%); }
          50% { transform: translate(1%, -1%); }
          75% { transform: translate(-1%, -1%); }
          100% { transform: translate(1%, 1%); }
        }
        @keyframes crtSyncFlash {
          0% { opacity: 1; filter: brightness(1.5) saturate(0.8); }
          40% { opacity: 1; filter: brightness(1.8) saturate(0.5); }
          100% { opacity: 0.95; filter: brightness(1) saturate(1); }
        }
        @keyframes crtFadeOut {
          0% { opacity: 0.95; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  )
}
