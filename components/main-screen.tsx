"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Settings, Volume2, VolumeX, Loader2 } from "lucide-react"
import type { VhsIntensity } from "@/app/page"
import VhsEffects from "./vhs-effects"

class CRTSoundEngine {
  private audioContext: AudioContext | null = null
  private masterGain: GainNode | null = null
  private isMuted = false

  init() {
    if (this.audioContext) return
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    this.masterGain = this.audioContext.createGain()
    this.masterGain.connect(this.audioContext.destination)
    this.masterGain.gain.value = 0.6
  }

  setMuted(muted: boolean) {
    this.isMuted = muted
    if (this.masterGain) {
      this.masterGain.gain.value = muted ? 0 : 0.6
    }
  }

  // Sonido de degauss/encendido inicial del CRT
  playDegauss() {
    if (!this.audioContext || !this.masterGain || this.isMuted) return

    const duration = 0.8
    const osc = this.audioContext.createOscillator()
    const gain = this.audioContext.createGain()
    const filter = this.audioContext.createBiquadFilter()

    filter.type = "lowpass"
    filter.frequency.setValueAtTime(800, this.audioContext.currentTime)
    filter.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + duration)

    osc.type = "sawtooth"
    osc.frequency.setValueAtTime(120, this.audioContext.currentTime)
    osc.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + duration)

    gain.gain.setValueAtTime(0.25, this.audioContext.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration)

    osc.connect(filter)
    filter.connect(gain)
    gain.connect(this.masterGain)

    osc.start()
    osc.stop(this.audioContext.currentTime + duration)
  }

  // Sonido de alta tension del flyback transformer
  playFlybackWhine() {
    if (!this.audioContext || !this.masterGain || this.isMuted) return

    const osc = this.audioContext.createOscillator()
    const gain = this.audioContext.createGain()

    osc.type = "sine"
    osc.frequency.setValueAtTime(15734, this.audioContext.currentTime) // Frecuencia real del flyback NTSC

    gain.gain.setValueAtTime(0, this.audioContext.currentTime)
    gain.gain.linearRampToValueAtTime(0.015, this.audioContext.currentTime + 0.3)
    gain.gain.setValueAtTime(0.015, this.audioContext.currentTime + 2)
    gain.gain.linearRampToValueAtTime(0.008, this.audioContext.currentTime + 4)

    osc.connect(gain)
    gain.connect(this.masterGain)

    osc.start()

    return {
      stop: () => {
        gain.gain.linearRampToValueAtTime(0, this.audioContext!.currentTime + 0.5)
        setTimeout(() => osc.stop(), 500)
      },
    }
  }

  // Estatica de TV
  playStatic(duration = 2) {
    if (!this.audioContext || !this.masterGain || this.isMuted) return

    const bufferSize = this.audioContext.sampleRate * duration
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate)
    const data = buffer.getChannelData(0)

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.5
    }

    const source = this.audioContext.createBufferSource()
    const gain = this.audioContext.createGain()
    const filter = this.audioContext.createBiquadFilter()

    filter.type = "bandpass"
    filter.frequency.value = 3000
    filter.Q.value = 0.5

    source.buffer = buffer
    gain.gain.setValueAtTime(0.15, this.audioContext.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration)

    source.connect(filter)
    filter.connect(gain)
    gain.connect(this.masterGain)

    source.start()

    return { stop: () => source.stop() }
  }

  // Click de encendido de switch
  playPowerClick() {
    if (!this.audioContext || !this.masterGain || this.isMuted) return

    const osc = this.audioContext.createOscillator()
    const gain = this.audioContext.createGain()

    osc.type = "square"
    osc.frequency.setValueAtTime(150, this.audioContext.currentTime)
    osc.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.05)

    gain.gain.setValueAtTime(0.3, this.audioContext.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.08)

    osc.connect(gain)
    gain.connect(this.masterGain)

    osc.start()
    osc.stop(this.audioContext.currentTime + 0.08)
  }

  // Zumbido electrico de CRT (60Hz hum)
  playHum() {
    if (!this.audioContext || !this.masterGain || this.isMuted) return

    const osc = this.audioContext.createOscillator()
    const osc2 = this.audioContext.createOscillator()
    const gain = this.audioContext.createGain()

    osc.type = "sine"
    osc.frequency.value = 60 // 60Hz hum
    osc2.type = "sine"
    osc2.frequency.value = 120 // Armonico

    gain.gain.value = 0.02

    osc.connect(gain)
    osc2.connect(gain)
    gain.connect(this.masterGain)

    osc.start()
    osc2.start()

    return {
      stop: () => {
        gain.gain.linearRampToValueAtTime(0, this.audioContext!.currentTime + 0.3)
        setTimeout(() => {
          osc.stop()
          osc2.stop()
        }, 300)
      },
    }
  }

  // Sonido de expansion vertical (woosh magnetico)
  playVerticalExpand() {
    if (!this.audioContext || !this.masterGain || this.isMuted) return

    const duration = 1.2
    const osc = this.audioContext.createOscillator()
    const gain = this.audioContext.createGain()
    const filter = this.audioContext.createBiquadFilter()

    filter.type = "lowpass"
    filter.frequency.setValueAtTime(200, this.audioContext.currentTime)
    filter.frequency.linearRampToValueAtTime(800, this.audioContext.currentTime + duration * 0.3)
    filter.frequency.linearRampToValueAtTime(400, this.audioContext.currentTime + duration)

    osc.type = "sawtooth"
    osc.frequency.setValueAtTime(80, this.audioContext.currentTime)
    osc.frequency.linearRampToValueAtTime(200, this.audioContext.currentTime + duration * 0.4)
    osc.frequency.linearRampToValueAtTime(100, this.audioContext.currentTime + duration)

    gain.gain.setValueAtTime(0.08, this.audioContext.currentTime)
    gain.gain.linearRampToValueAtTime(0.15, this.audioContext.currentTime + duration * 0.3)
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration)

    osc.connect(filter)
    filter.connect(gain)
    gain.connect(this.masterGain)

    osc.start()
    osc.stop(this.audioContext.currentTime + duration)
  }

  // Flash de sincronizacion (pop electrico)
  playSyncFlash() {
    if (!this.audioContext || !this.masterGain || this.isMuted) return

    const osc = this.audioContext.createOscillator()
    const gain = this.audioContext.createGain()

    osc.type = "sine"
    osc.frequency.setValueAtTime(1000, this.audioContext.currentTime)
    osc.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.1)

    gain.gain.setValueAtTime(0.2, this.audioContext.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.15)

    osc.connect(gain)
    gain.connect(this.masterGain)

    osc.start()
    osc.stop(this.audioContext.currentTime + 0.15)
  }

  // Sonido de click de boton
  playButtonClick() {
    if (!this.audioContext || !this.masterGain || this.isMuted) return

    const osc = this.audioContext.createOscillator()
    const gain = this.audioContext.createGain()

    osc.type = "sine"
    osc.frequency.value = 800

    gain.gain.setValueAtTime(0.1, this.audioContext.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.05)

    osc.connect(gain)
    gain.connect(this.masterGain)

    osc.start()
    osc.stop(this.audioContext.currentTime + 0.05)
  }
}

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
  const soundEngineRef = useRef<CRTSoundEngine | null>(null)
  const humRef = useRef<{ stop: () => void } | null>(null)
  const flybackRef = useRef<{ stop: () => void } | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 })

  // Inicializar motor de sonido
  useEffect(() => {
    soundEngineRef.current = new CRTSoundEngine()
  }, [])

  useEffect(() => {
    if (soundEngineRef.current) {
      soundEngineRef.current.setMuted(isMuted)
    }
    if (audioRef.current) {
      audioRef.current.muted = isMuted
    }
  }, [isMuted])

  useEffect(() => {
    if (tvTurnedOn && soundEngineRef.current) {
      soundEngineRef.current.init()
      setTvAnimation("turning-on")

      // Click de encendido
      soundEngineRef.current.playPowerClick()

      // Degauss despues del click
      setTimeout(() => soundEngineRef.current?.playDegauss(), 100)

      // Estatica durante la linea horizontal
      setTimeout(() => soundEngineRef.current?.playStatic(1.5), 400)

      // Expansion vertical con sonido magnetico
      setTimeout(() => soundEngineRef.current?.playVerticalExpand(), 1200)

      // Flash de sincronizacion
      setTimeout(() => soundEngineRef.current?.playSyncFlash(), 2400)

      // Iniciar flyback whine y hum continuo
      setTimeout(() => {
        flybackRef.current = soundEngineRef.current?.playFlybackWhine() || null
        humRef.current = soundEngineRef.current?.playHum() || null
      }, 2600)

      setTimeout(() => {
        setTvAnimation("on")
        setTimeout(() => {
          setEffectsEnabled(true)
          setContentVisible(true)
        }, 500)
      }, 2800)
    }

    return () => {
      humRef.current?.stop()
      flybackRef.current?.stop()
    }
  }, [tvTurnedOn])

  // Musica de fondo
  useEffect(() => {
    if (tvAnimation === "on" && !audioRef.current) {
      audioRef.current = new Audio("https://assets.mixkit.co/music/preview/mixkit-sleepy-cat-135.mp3")
      audioRef.current.loop = true
      audioRef.current.volume = 0.12
      audioRef.current.muted = isMuted
      audioRef.current.play().catch(() => {})
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [tvAnimation, isMuted])

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

  const handleSettingsClick = useCallback(() => {
    soundEngineRef.current?.playButtonClick()
    onSettingsClick()
  }, [onSettingsClick])

  const handleProjectRivalsClick = useCallback(() => {
    soundEngineRef.current?.playButtonClick()
    onProjectRivalsClick()
  }, [onProjectRivalsClick])

  return (
    <div className="relative w-full h-full overflow-hidden bg-black">
      {/* Fondo negro base */}
      <div className="absolute inset-0 bg-black z-0" />

      {/* Animacion de encendido */}
      {tvAnimation === "turning-on" && <TvTurnOnAnimation />}

      {/* Contenido principal */}
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
            {/* Botones superiores */}
            <div className="absolute top-4 right-4 md:top-6 md:right-6 flex gap-2 md:gap-3">
              <button
                onClick={() => {
                  soundEngineRef.current?.playButtonClick()
                  setIsMuted(!isMuted)
                }}
                className="p-2 md:p-3 bg-black/50 backdrop-blur-sm border border-white/10 rounded-lg hover:bg-white/10 hover:border-white/20 transition-all duration-300 group"
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4 md:w-5 md:h-5 text-white/60 group-hover:text-white transition-colors" />
                ) : (
                  <Volume2 className="w-4 h-4 md:w-5 md:h-5 text-white/60 group-hover:text-white transition-colors" />
                )}
              </button>
              <button
                onClick={handleSettingsClick}
                className="p-2 md:p-3 bg-black/50 backdrop-blur-sm border border-white/10 rounded-lg hover:bg-white/10 hover:border-white/20 transition-all duration-300 group"
              >
                <Settings className="w-4 h-4 md:w-5 md:h-5 text-white/60 group-hover:text-white group-hover:rotate-90 transition-all duration-500" />
              </button>
            </div>

            <div className="flex-1" />

            {/* Boton principal */}
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
                onClick={handleProjectRivalsClick}
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

          {/* VHS Effects */}
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
    const noiseInterval = setInterval(() => {
      setStaticNoise(Array.from({ length: 50 }, () => Math.random()))
    }, 50)

    const phases = [50, 150, 300, 500, 750, 1000, 1200, 1500, 1800, 2100, 2400, 2600, 2800]
    phases.forEach((delay, index) => {
      setTimeout(() => setPhase(index + 1), delay)
    })

    return () => clearInterval(noiseInterval)
  }, [])

  return (
    <div className="absolute inset-0 z-50 pointer-events-none overflow-hidden">
      <div className="absolute inset-0 bg-black" />

      {/* Punto inicial */}
      {phase >= 1 && phase <= 5 && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
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

      {/* Linea horizontal */}
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
              0 0 50px 10px rgba(150,180,255,0.4)
            `,
            transition: "width 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          }}
        />
      )}

      {/* Estatica */}
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

      {/* Expansion vertical */}
      {phase >= 8 && phase <= 11 && (
        <div
          className="absolute left-0 right-0 top-1/2 overflow-hidden"
          style={{
            height: phase === 8 ? "10%" : phase === 9 ? "40%" : phase === 10 ? "80%" : "100%",
            transform: "translateY(-50%)",
            transition: "height 0.28s cubic-bezier(0.22, 0.61, 0.36, 1)",
          }}
        >
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
            }}
          />
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
        </div>
      )}

      {/* Flash */}
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

      {/* Fade out */}
      {phase === 13 && (
        <div className="absolute inset-0 bg-white" style={{ animation: "crtFadeOut 0.35s ease-out forwards" }} />
      )}

      {/* Borde CRT */}
      {phase >= 4 && phase <= 12 && (
        <>
          <div
            className="absolute inset-0"
            style={{
              boxShadow: "inset 0 0 60px 25px rgba(0,0,0,0.6), inset 0 0 120px 50px rgba(0,0,0,0.3)",
              borderRadius: "4%",
            }}
          />
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
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.3); }
        }
        @keyframes crtRolling {
          0% { transform: translateY(0); }
          100% { transform: translateY(60px); }
        }
        @keyframes crtSyncFlash {
          0% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes crtFadeOut {
          0% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  )
}
