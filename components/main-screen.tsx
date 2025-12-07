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
    this.masterGain.gain.value = 0.5
  }

  setMuted(muted: boolean) {
    this.isMuted = muted
    if (this.masterGain) {
      this.masterGain.gain.value = muted ? 0 : 0.5
    }
  }

  playPowerClick() {
    if (!this.audioContext || !this.masterGain || this.isMuted) return

    // Click mecanico inicial
    const clickOsc = this.audioContext.createOscillator()
    const clickGain = this.audioContext.createGain()
    const clickFilter = this.audioContext.createBiquadFilter()

    clickFilter.type = "bandpass"
    clickFilter.frequency.value = 2000
    clickFilter.Q.value = 1

    clickOsc.type = "square"
    clickOsc.frequency.setValueAtTime(180, this.audioContext.currentTime)
    clickOsc.frequency.exponentialRampToValueAtTime(60, this.audioContext.currentTime + 0.03)

    clickGain.gain.setValueAtTime(0.4, this.audioContext.currentTime)
    clickGain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.05)

    clickOsc.connect(clickFilter)
    clickFilter.connect(clickGain)
    clickGain.connect(this.masterGain)

    clickOsc.start()
    clickOsc.stop(this.audioContext.currentTime + 0.05)

    // Ruido de relay/rele
    const noiseBuffer = this.audioContext.createBuffer(
      1,
      this.audioContext.sampleRate * 0.03,
      this.audioContext.sampleRate,
    )
    const noiseData = noiseBuffer.getChannelData(0)
    for (let i = 0; i < noiseData.length; i++) {
      noiseData[i] = (Math.random() * 2 - 1) * 0.5
    }

    const noiseSource = this.audioContext.createBufferSource()
    const noiseGain = this.audioContext.createGain()
    const noiseFilter = this.audioContext.createBiquadFilter()

    noiseFilter.type = "highpass"
    noiseFilter.frequency.value = 1000

    noiseSource.buffer = noiseBuffer
    noiseGain.gain.setValueAtTime(0.2, this.audioContext.currentTime)
    noiseGain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.03)

    noiseSource.connect(noiseFilter)
    noiseFilter.connect(noiseGain)
    noiseGain.connect(this.masterGain)

    noiseSource.start(this.audioContext.currentTime + 0.01)
  }

  playDegauss() {
    if (!this.audioContext || !this.masterGain || this.isMuted) return

    const duration = 1.2

    // Oscilador principal de degauss
    const osc = this.audioContext.createOscillator()
    const osc2 = this.audioContext.createOscillator()
    const gain = this.audioContext.createGain()
    const filter = this.audioContext.createBiquadFilter()

    filter.type = "lowpass"
    filter.frequency.setValueAtTime(400, this.audioContext.currentTime)
    filter.frequency.exponentialRampToValueAtTime(80, this.audioContext.currentTime + duration)

    osc.type = "sawtooth"
    osc.frequency.setValueAtTime(120, this.audioContext.currentTime)
    osc.frequency.exponentialRampToValueAtTime(40, this.audioContext.currentTime + duration)

    osc2.type = "sine"
    osc2.frequency.setValueAtTime(60, this.audioContext.currentTime) // 60Hz hum

    gain.gain.setValueAtTime(0.2, this.audioContext.currentTime)
    gain.gain.linearRampToValueAtTime(0.25, this.audioContext.currentTime + 0.2)
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration)

    osc.connect(filter)
    osc2.connect(filter)
    filter.connect(gain)
    gain.connect(this.masterGain)

    osc.start()
    osc2.start()
    osc.stop(this.audioContext.currentTime + duration)
    osc2.stop(this.audioContext.currentTime + duration)
  }

  playHighVoltageCharge() {
    if (!this.audioContext || !this.masterGain || this.isMuted) return

    const duration = 0.8

    const osc = this.audioContext.createOscillator()
    const gain = this.audioContext.createGain()
    const filter = this.audioContext.createBiquadFilter()

    filter.type = "highpass"
    filter.frequency.value = 8000

    osc.type = "sawtooth"
    osc.frequency.setValueAtTime(100, this.audioContext.currentTime)
    osc.frequency.exponentialRampToValueAtTime(15734, this.audioContext.currentTime + duration) // Frecuencia flyback

    gain.gain.setValueAtTime(0.02, this.audioContext.currentTime)
    gain.gain.linearRampToValueAtTime(0.05, this.audioContext.currentTime + duration * 0.8)
    gain.gain.exponentialRampToValueAtTime(0.02, this.audioContext.currentTime + duration)

    osc.connect(filter)
    filter.connect(gain)
    gain.connect(this.masterGain)

    osc.start()
    osc.stop(this.audioContext.currentTime + duration)
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
    filter.frequency.value = 2500
    filter.Q.value = 0.7

    source.buffer = buffer
    gain.gain.setValueAtTime(0.12, this.audioContext.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration)

    source.connect(filter)
    filter.connect(gain)
    gain.connect(this.masterGain)

    source.start()

    return { stop: () => source.stop() }
  }

  playBeamExpand() {
    if (!this.audioContext || !this.masterGain || this.isMuted) return

    const duration = 1.5

    const osc = this.audioContext.createOscillator()
    const gain = this.audioContext.createGain()
    const filter = this.audioContext.createBiquadFilter()

    filter.type = "lowpass"
    filter.frequency.setValueAtTime(150, this.audioContext.currentTime)
    filter.frequency.linearRampToValueAtTime(600, this.audioContext.currentTime + duration * 0.5)
    filter.frequency.linearRampToValueAtTime(300, this.audioContext.currentTime + duration)

    osc.type = "sine"
    osc.frequency.setValueAtTime(50, this.audioContext.currentTime)
    osc.frequency.linearRampToValueAtTime(120, this.audioContext.currentTime + duration * 0.3)
    osc.frequency.linearRampToValueAtTime(80, this.audioContext.currentTime + duration)

    gain.gain.setValueAtTime(0.15, this.audioContext.currentTime)
    gain.gain.linearRampToValueAtTime(0.2, this.audioContext.currentTime + duration * 0.4)
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration)

    osc.connect(filter)
    filter.connect(gain)
    gain.connect(this.masterGain)

    osc.start()
    osc.stop(this.audioContext.currentTime + duration)
  }

  // Flyback whine continuo
  playFlybackWhine() {
    if (!this.audioContext || !this.masterGain || this.isMuted) return

    const osc = this.audioContext.createOscillator()
    const gain = this.audioContext.createGain()

    osc.type = "sine"
    osc.frequency.setValueAtTime(15734, this.audioContext.currentTime)

    gain.gain.setValueAtTime(0, this.audioContext.currentTime)
    gain.gain.linearRampToValueAtTime(0.012, this.audioContext.currentTime + 0.3)
    gain.gain.setValueAtTime(0.012, this.audioContext.currentTime + 2)
    gain.gain.linearRampToValueAtTime(0.006, this.audioContext.currentTime + 4)

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

  // Hum electrico
  playHum() {
    if (!this.audioContext || !this.masterGain || this.isMuted) return

    const osc = this.audioContext.createOscillator()
    const osc2 = this.audioContext.createOscillator()
    const gain = this.audioContext.createGain()

    osc.type = "sine"
    osc.frequency.value = 60
    osc2.type = "sine"
    osc2.frequency.value = 120

    gain.gain.value = 0.015

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

  playSyncFlash() {
    if (!this.audioContext || !this.masterGain || this.isMuted) return

    const osc = this.audioContext.createOscillator()
    const osc2 = this.audioContext.createOscillator()
    const gain = this.audioContext.createGain()

    osc.type = "sine"
    osc.frequency.setValueAtTime(2000, this.audioContext.currentTime)
    osc.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.15)

    osc2.type = "square"
    osc2.frequency.setValueAtTime(100, this.audioContext.currentTime)

    gain.gain.setValueAtTime(0.25, this.audioContext.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.2)

    osc.connect(gain)
    osc2.connect(gain)
    gain.connect(this.masterGain)

    osc.start()
    osc2.start()
    osc.stop(this.audioContext.currentTime + 0.2)
    osc2.stop(this.audioContext.currentTime + 0.2)
  }

  playButtonClick() {
    if (!this.audioContext || !this.masterGain || this.isMuted) return

    const osc = this.audioContext.createOscillator()
    const gain = this.audioContext.createGain()

    osc.type = "sine"
    osc.frequency.value = 800

    gain.gain.setValueAtTime(0.08, this.audioContext.currentTime)
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

      // Click de power
      soundEngineRef.current.playPowerClick()

      // Carga de alta tension
      setTimeout(() => soundEngineRef.current?.playHighVoltageCharge(), 150)

      // Degauss
      setTimeout(() => soundEngineRef.current?.playDegauss(), 300)

      // Estatica inicial
      setTimeout(() => soundEngineRef.current?.playStatic(1.2), 600)

      // Expansion del haz
      setTimeout(() => soundEngineRef.current?.playBeamExpand(), 1400)

      // Flash de sincronizacion
      setTimeout(() => soundEngineRef.current?.playSyncFlash(), 2600)

      // Sonidos continuos
      setTimeout(() => {
        flybackRef.current = soundEngineRef.current?.playFlybackWhine() || null
        humRef.current = soundEngineRef.current?.playHum() || null
      }, 2800)

      setTimeout(() => {
        setTvAnimation("on")
        setTimeout(() => {
          setEffectsEnabled(true)
          setContentVisible(true)
        }, 500)
      }, 3000)
    }

    return () => {
      humRef.current?.stop()
      flybackRef.current?.stop()
    }
  }, [tvTurnedOn])

  useEffect(() => {
    if (tvAnimation === "on" && !audioRef.current) {
      audioRef.current = new Audio("https://assets.mixkit.co/music/preview/mixkit-sleepy-cat-135.mp3")
      audioRef.current.loop = true
      audioRef.current.volume = 0.1
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
      <div className="absolute inset-0 bg-black z-0" />

      {tvAnimation === "turning-on" && <TvTurnOnAnimation />}

      {tvAnimation === "on" && (
        <>
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

          <div
            className="absolute inset-0 z-20 transition-opacity duration-1000"
            style={{
              background:
                "radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.4) 70%, rgba(0,0,0,0.8) 100%)",
              opacity: contentVisible ? 1 : 0,
            }}
          />

          <div
            className="relative z-30 w-full h-full flex flex-col transition-opacity duration-700"
            style={{ opacity: contentVisible ? 1 : 0 }}
          >
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
      50, // 1: punto inicial
      150, // 2: punto pulsando
      350, // 3: punto mas brillante
      550, // 4: inicio linea horizontal
      800, // 5: linea expandiendose
      1100, // 6: linea completa
      1400, // 7: flicker
      1700, // 8: inicio expansion vertical
      2000, // 9: expansion vertical media
      2300, // 10: expansion casi completa
      2600, // 11: flash
      2900, // 12: finalizado
    ]
    phases.forEach((delay, index) => {
      setTimeout(() => setPhase(index + 1), delay)
    })
  }, [])

  return (
    <div className="absolute inset-0 z-50 pointer-events-none overflow-hidden">
      <div className="absolute inset-0 bg-black" />

      {/* Punto inicial brillante */}
      {phase >= 1 && phase <= 5 && (
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div
            className="rounded-full"
            style={{
              width: phase <= 2 ? "4px" : phase <= 3 ? "6px" : "4px",
              height: phase <= 2 ? "4px" : phase <= 3 ? "6px" : "4px",
              backgroundColor: "white",
              boxShadow: `
                0 0 ${10 + phase * 5}px ${5 + phase * 2}px rgba(255,255,255,0.9),
                0 0 ${20 + phase * 10}px ${10 + phase * 4}px rgba(200,220,255,0.6),
                0 0 ${40 + phase * 15}px ${15 + phase * 5}px rgba(150,180,255,0.3)
              `,
              animation: phase === 2 ? "pulse 0.1s ease-in-out infinite" : "none",
            }}
          />
        </div>
      )}

      {/* Linea horizontal expandiendose */}
      {phase >= 4 && phase <= 7 && (
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: phase === 4 ? "20px" : phase === 5 ? "40%" : phase === 6 ? "80%" : "100%",
            height: "3px",
            background: "linear-gradient(90deg, transparent 0%, white 20%, white 80%, transparent 100%)",
            boxShadow: `
              0 0 20px 5px rgba(255,255,255,0.8),
              0 0 40px 10px rgba(200,220,255,0.5),
              0 0 60px 15px rgba(150,180,255,0.3)
            `,
            transition: "width 0.25s ease-out",
            opacity: phase === 7 ? (Math.random() > 0.5 ? 1 : 0.3) : 1,
          }}
        />
      )}

      {/* Expansion vertical */}
      {phase >= 8 && phase <= 11 && (
        <div
          className="absolute left-0 right-0 top-1/2 -translate-y-1/2 overflow-hidden"
          style={{
            height: phase === 8 ? "10%" : phase === 9 ? "40%" : phase === 10 ? "80%" : "100%",
            transition: "height 0.3s ease-out",
          }}
        >
          {/* Contenido con estatica */}
          <div
            className="absolute inset-0"
            style={{
              background:
                phase <= 10
                  ? `repeating-linear-gradient(
                    0deg,
                    rgba(255,255,255,0.03) 0px,
                    rgba(255,255,255,0.03) 1px,
                    transparent 1px,
                    transparent 2px
                  )`
                  : "transparent",
            }}
          />

          {/* Scanlines durante expansion */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)",
              opacity: phase <= 10 ? 0.5 : 0,
            }}
          />

          {/* Glow de bordes */}
          <div
            className="absolute inset-x-0 top-0 h-4"
            style={{
              background: "linear-gradient(to bottom, rgba(255,255,255,0.5), transparent)",
            }}
          />
          <div
            className="absolute inset-x-0 bottom-0 h-4"
            style={{
              background: "linear-gradient(to top, rgba(255,255,255,0.5), transparent)",
            }}
          />
        </div>
      )}

      {/* Flash final */}
      {phase === 11 && (
        <div
          className="absolute inset-0 bg-white"
          style={{
            animation: "flashFade 0.3s ease-out forwards",
          }}
        />
      )}

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.2); }
        }
        @keyframes flashFade {
          0% { opacity: 0.8; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  )
}
