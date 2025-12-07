"use client"

import { useState, useEffect, useRef } from "react"

interface CmdLoaderProps {
  onComplete: () => void
}

declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext
  }
}

class CMDSoundEngine {
  private audioContext: AudioContext | null = null
  private masterGain: GainNode | null = null

  init() {
    if (this.audioContext) return
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
    this.masterGain = this.audioContext.createGain()
    this.masterGain.connect(this.audioContext.destination)
    this.masterGain.gain.value = 0.4
  }

  // Sonido de tecla siendo presionada
  playKeystroke() {
    if (!this.audioContext || !this.masterGain) return

    const osc = this.audioContext.createOscillator()
    const gain = this.audioContext.createGain()
    const filter = this.audioContext.createBiquadFilter()

    filter.type = "highpass"
    filter.frequency.value = 800

    // Variacion aleatoria para que suene mas natural
    const baseFreq = 1200 + Math.random() * 600
    osc.type = "square"
    osc.frequency.setValueAtTime(baseFreq, this.audioContext.currentTime)
    osc.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.03)

    gain.gain.setValueAtTime(0.08 + Math.random() * 0.04, this.audioContext.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.04)

    osc.connect(filter)
    filter.connect(gain)
    gain.connect(this.masterGain)

    osc.start()
    osc.stop(this.audioContext.currentTime + 0.04)
  }

  // Sonido de beep del sistema
  playSystemBeep() {
    if (!this.audioContext || !this.masterGain) return

    const osc = this.audioContext.createOscillator()
    const gain = this.audioContext.createGain()

    osc.type = "square"
    osc.frequency.value = 800

    gain.gain.setValueAtTime(0.1, this.audioContext.currentTime)
    gain.gain.setValueAtTime(0.1, this.audioContext.currentTime + 0.1)
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.15)

    osc.connect(gain)
    gain.connect(this.masterGain)

    osc.start()
    osc.stop(this.audioContext.currentTime + 0.15)
  }

  // Sonido de OK/Success
  playSuccess() {
    if (!this.audioContext || !this.masterGain) return

    const osc = this.audioContext.createOscillator()
    const gain = this.audioContext.createGain()

    osc.type = "sine"
    osc.frequency.setValueAtTime(523, this.audioContext.currentTime) // C5
    osc.frequency.setValueAtTime(659, this.audioContext.currentTime + 0.1) // E5

    gain.gain.setValueAtTime(0.08, this.audioContext.currentTime)
    gain.gain.setValueAtTime(0.08, this.audioContext.currentTime + 0.15)
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.25)

    osc.connect(gain)
    gain.connect(this.masterGain)

    osc.start()
    osc.stop(this.audioContext.currentTime + 0.25)
  }

  // Sonido de progreso de barra
  playProgressTick() {
    if (!this.audioContext || !this.masterGain) return

    const osc = this.audioContext.createOscillator()
    const gain = this.audioContext.createGain()

    osc.type = "sine"
    osc.frequency.value = 1000 + Math.random() * 200

    gain.gain.setValueAtTime(0.03, this.audioContext.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.02)

    osc.connect(gain)
    gain.connect(this.masterGain)

    osc.start()
    osc.stop(this.audioContext.currentTime + 0.02)
  }

  // Sonido de disco duro trabajando
  playHDDActivity() {
    if (!this.audioContext || !this.masterGain) return

    const bufferSize = this.audioContext.sampleRate * 0.08
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate)
    const data = buffer.getChannelData(0)

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.3
    }

    const source = this.audioContext.createBufferSource()
    const gain = this.audioContext.createGain()
    const filter = this.audioContext.createBiquadFilter()

    filter.type = "bandpass"
    filter.frequency.value = 400
    filter.Q.value = 2

    source.buffer = buffer
    gain.gain.setValueAtTime(0.06, this.audioContext.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.08)

    source.connect(filter)
    filter.connect(gain)
    gain.connect(this.masterGain)

    source.start()
  }

  // Sonido de inicio/boot
  playBootSound() {
    if (!this.audioContext || !this.masterGain) return

    const notes = [262, 330, 392, 523] // C4, E4, G4, C5
    notes.forEach((freq, i) => {
      setTimeout(() => {
        const osc = this.audioContext!.createOscillator()
        const gain = this.audioContext!.createGain()

        osc.type = "sine"
        osc.frequency.value = freq

        gain.gain.setValueAtTime(0.1, this.audioContext!.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext!.currentTime + 0.2)

        osc.connect(gain)
        gain.connect(this.masterGain!)

        osc.start()
        osc.stop(this.audioContext!.currentTime + 0.2)
      }, i * 100)
    })
  }

  // Sonido final de ready
  playReadySound() {
    if (!this.audioContext || !this.masterGain) return

    const osc = this.audioContext.createOscillator()
    const osc2 = this.audioContext.createOscillator()
    const gain = this.audioContext.createGain()

    osc.type = "sine"
    osc2.type = "sine"
    osc.frequency.value = 880
    osc2.frequency.value = 1108.73 // C#6

    gain.gain.setValueAtTime(0.12, this.audioContext.currentTime)
    gain.gain.setValueAtTime(0.12, this.audioContext.currentTime + 0.3)
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.5)

    osc.connect(gain)
    osc2.connect(gain)
    gain.connect(this.masterGain)

    osc.start()
    osc2.start()
    osc.stop(this.audioContext.currentTime + 0.5)
    osc2.stop(this.audioContext.currentTime + 0.5)
  }
}

const asciiArt = [
  "",
  "  ██████╗ ██╗    ██╗███████╗██████╗ ████████╗██╗   ██╗",
  " ██╔═══██╗██║    ██║██╔════╝██╔══██╗╚══██╔══╝╚██╗ ██╔╝",
  " ██║   ██║██║ █╗ ██║█████╗  ██████╔╝   ██║    ╚████╔╝ ",
  " ██║▄▄ ██║██║███╗██║██╔══╝  ██╔══██╗   ██║     ╚██╔╝  ",
  " ╚██████╔╝╚███╔███╔╝███████╗██║  ██║   ██║      ██║   ",
  "  ╚══▀▀═╝  ╚══╝╚══╝ ╚══════╝╚═╝  ╚═╝   ╚═╝      ╚═╝   ",
  "",
  " ██╗      █████╗ ██╗   ██╗███╗   ██╗ ██████╗██╗  ██╗███████╗██████╗ ",
  " ██║     ██╔══██╗██║   ██║████╗  ██║██╔════╝██║  ██║██╔════╝██╔══██╗",
  " ██║     ███████║██║   ██║██╔██╗ ██║██║     ███████║█████╗  ██████╔╝",
  " ██║     ██╔══██║██║   ██║██║╚██╗██║██║     ██╔══██║██╔══╝  ██╔══██╗",
  " ███████╗██║  ██║╚██████╔╝██║ ╚████║╚██████╗██║  ██║███████╗██║  ██║",
  " ╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═══╝ ╚═════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝",
  "",
]

const cmdLines = [
  { text: "Microsoft Windows [Version 10.0.22631.4460]", delay: 0, type: "system" },
  { text: "(c) Microsoft Corporation. All rights reserved.", delay: 150, type: "system" },
  { text: "", delay: 300, type: "blank" },
  { text: "C:\\Users\\Player> cd QwertyLauncher", delay: 500, type: "command", typing: true },
  { text: "", delay: 1200, type: "blank" },
  { text: "C:\\Users\\Player\\QwertyLauncher> launcher.exe --init", delay: 1400, type: "command", typing: true },
  { text: "", delay: 2200, type: "blank" },
  { text: "ascii", delay: 2400, type: "ascii" }, // Marcador para el arte ASCII
  { text: "", delay: 4000, type: "blank" },
  { text: "════════════════════════════════════════════════════════════════════", delay: 4200, type: "divider" },
  { text: "                    QWERTY LAUNCHER v3.0.0 BETA                     ", delay: 4400, type: "title" },
  { text: "              Minecraft Bedrock Server Connector                    ", delay: 4600, type: "subtitle" },
  { text: "════════════════════════════════════════════════════════════════════", delay: 4800, type: "divider" },
  { text: "", delay: 5000, type: "blank" },
  { text: "[BOOT] Initializing system components...", delay: 5200, type: "boot" },
  { text: "[████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░]  10%", delay: 5400, type: "progress" },
  { text: "[OK] Core engine loaded", delay: 5600, type: "success" },
  { text: "", delay: 5800, type: "blank" },
  { text: "[SYSTEM] Loading configuration files...", delay: 6000, type: "info" },
  { text: "[████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░]  20%", delay: 6200, type: "progress" },
  { text: "[OK] config.json parsed successfully", delay: 6400, type: "success" },
  { text: "[OK] user_preferences.dat loaded", delay: 6600, type: "success" },
  { text: "", delay: 6800, type: "blank" },
  { text: "[NETWORK] Establishing connection...", delay: 7000, type: "network" },
  { text: "[████████████████░░░░░░░░░░░░░░░░░░░░░░░░]  40%", delay: 7200, type: "progress" },
  { text: "[OK] DNS resolved: projectrivalsbedrock.exaroton.me", delay: 7600, type: "success" },
  { text: "[OK] TCP handshake completed on port 24565", delay: 8000, type: "success" },
  { text: "[OK] Server ping: 45ms", delay: 8400, type: "success" },
  { text: "", delay: 8600, type: "blank" },
  { text: "[ASSETS] Loading game resources...", delay: 8800, type: "info" },
  { text: "[████████████████████████░░░░░░░░░░░░░░░░]  60%", delay: 9000, type: "progress" },
  { text: "  > textures.pak .......... OK (2.4 MB)", delay: 9200, type: "file" },
  { text: "  > sounds.pak ............ OK (1.8 MB)", delay: 9400, type: "file" },
  { text: "  > shaders.pak ........... OK (0.9 MB)", delay: 9600, type: "file" },
  { text: "  > ui_resources.pak ...... OK (0.5 MB)", delay: 9800, type: "file" },
  { text: "", delay: 10000, type: "blank" },
  { text: "[DISPLAY] Initializing graphics subsystem...", delay: 10200, type: "info" },
  { text: "[████████████████████████████████░░░░░░░░]  80%", delay: 10400, type: "progress" },
  { text: "[OK] CRT emulation driver v2.1 loaded", delay: 10600, type: "success" },
  { text: "[OK] VHS effect shader compiled", delay: 10800, type: "success" },
  { text: "[OK] Scanline overlay initialized", delay: 11000, type: "success" },
  { text: "", delay: 11200, type: "blank" },
  { text: "[AUDIO] Configuring sound system...", delay: 11400, type: "info" },
  { text: "[████████████████████████████████████████]  100%", delay: 11600, type: "progress" },
  { text: "[OK] Audio engine ready", delay: 11800, type: "success" },
  { text: "", delay: 12000, type: "blank" },
  { text: "════════════════════════════════════════════════════════════════════", delay: 12200, type: "divider" },
  { text: "  ✓ ALL SYSTEMS OPERATIONAL                                        ", delay: 12400, type: "ready" },
  { text: "  ✓ SERVER STATUS: ONLINE                                          ", delay: 12600, type: "ready" },
  { text: "  ✓ CONNECTION: READY                                              ", delay: 12800, type: "ready" },
  { text: "════════════════════════════════════════════════════════════════════", delay: 13000, type: "divider" },
  { text: "", delay: 13200, type: "blank" },
  { text: ">> INITIALIZING DISPLAY HARDWARE...", delay: 13400, type: "final" },
  { text: ">> POWERING ON CRT DISPLAY...", delay: 13800, type: "final" },
]

export default function CmdLoader({ onComplete }: CmdLoaderProps) {
  const [visibleLines, setVisibleLines] = useState<Array<{ text: string; type: string }>>([])
  const [cursorVisible, setCursorVisible] = useState(true)
  const [typingText, setTypingText] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const soundEngineRef = useRef<CMDSoundEngine | null>(null)

  useEffect(() => {
    soundEngineRef.current = new CMDSoundEngine()
    soundEngineRef.current.init()

    // Sonido de boot al iniciar
    setTimeout(() => soundEngineRef.current?.playBootSound(), 500)
  }, [])

  useEffect(() => {
    const timers: NodeJS.Timeout[] = []
    let lastDelay = 0

    cmdLines.forEach((line, index) => {
      const timer = setTimeout(() => {
        if (line.type === "ascii") {
          // Agregar arte ASCII linea por linea con sonido
          asciiArt.forEach((artLine, artIndex) => {
            setTimeout(() => {
              setVisibleLines((prev) => [...prev, { text: artLine, type: "ascii" }])
              if (artLine.trim()) {
                soundEngineRef.current?.playKeystroke()
              }
            }, artIndex * 80)
          })
        } else if (line.typing) {
          // Efecto de typing para comandos
          setIsTyping(true)
          const chars = line.text.split("")
          chars.forEach((char, charIndex) => {
            setTimeout(() => {
              setTypingText((prev) => prev + char)
              soundEngineRef.current?.playKeystroke()
              if (charIndex === chars.length - 1) {
                setTimeout(() => {
                  setVisibleLines((prev) => [...prev, { text: line.text, type: line.type }])
                  setTypingText("")
                  setIsTyping(false)
                }, 100)
              }
            }, charIndex * 30)
          })
        } else {
          setVisibleLines((prev) => [...prev, { text: line.text, type: line.type }])

          // Sonidos segun tipo de linea
          if (line.type === "success") {
            soundEngineRef.current?.playSuccess()
          } else if (line.type === "progress") {
            soundEngineRef.current?.playProgressTick()
          } else if (line.type === "file") {
            soundEngineRef.current?.playHDDActivity()
          } else if (line.type === "boot" || line.type === "network" || line.type === "info") {
            soundEngineRef.current?.playSystemBeep()
          } else if (line.type === "ready") {
            soundEngineRef.current?.playSuccess()
          } else if (line.type === "final") {
            soundEngineRef.current?.playReadySound()
          }
        }
        lastDelay = line.delay
      }, line.delay)
      timers.push(timer)
    })

    const completeTimer = setTimeout(() => {
      onComplete()
    }, 15000)
    timers.push(completeTimer)

    const cursorInterval = setInterval(() => {
      setCursorVisible((prev) => !prev)
    }, 530)

    return () => {
      timers.forEach(clearTimeout)
      clearInterval(cursorInterval)
    }
  }, [onComplete])

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [visibleLines, typingText])

  const getLineColor = (type: string) => {
    switch (type) {
      case "ascii":
        return "text-cyan-400"
      case "title":
        return "text-yellow-400 font-bold"
      case "subtitle":
        return "text-yellow-300/80"
      case "divider":
        return "text-gray-500"
      case "command":
        return "text-white"
      case "success":
        return "text-green-400"
      case "boot":
      case "info":
        return "text-cyan-300"
      case "network":
        return "text-blue-400"
      case "progress":
        return "text-yellow-300"
      case "file":
        return "text-gray-400"
      case "ready":
        return "text-green-400 font-bold"
      case "final":
        return "text-cyan-400 animate-pulse font-bold"
      default:
        return "text-gray-300"
    }
  }

  return (
    <div className="fixed inset-0 bg-[#0c0c0c] flex flex-col font-mono">
      {/* Barra de titulo estilo Windows CMD */}
      <div className="bg-[#000000] px-2 py-1.5 flex items-center justify-between border-b border-[#333] shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 flex items-center justify-center">
            <span className="text-[10px] text-gray-400">⌘</span>
          </div>
          <span className="text-gray-300 text-xs">Command Prompt - launcher.exe</span>
        </div>
        <div className="flex items-center">
          <div className="px-4 py-0.5 hover:bg-gray-800 text-gray-400 text-sm cursor-default transition-colors">─</div>
          <div className="px-4 py-0.5 hover:bg-gray-800 text-gray-400 text-sm cursor-default transition-colors">□</div>
          <div className="px-4 py-0.5 hover:bg-red-600 text-gray-400 text-sm cursor-default transition-colors">×</div>
        </div>
      </div>

      {/* Contenido CMD */}
      <div
        ref={containerRef}
        className="flex-1 p-3 md:p-4 overflow-y-auto text-xs md:text-sm leading-5 md:leading-6"
        style={{
          background: "linear-gradient(180deg, #0c0c0c 0%, #080808 100%)",
        }}
      >
        {visibleLines.map((line, index) => (
          <div
            key={index}
            className={`whitespace-pre ${getLineColor(line.type)}`}
            style={{
              textShadow:
                line.type === "ascii" || line.type === "ready" || line.type === "final"
                  ? "0 0 10px currentColor"
                  : "none",
            }}
          >
            {line.text || "\u00A0"}
          </div>
        ))}

        {/* Texto siendo escrito */}
        {isTyping && (
          <div className="text-white whitespace-pre">
            {typingText}
            <span className={`inline-block w-2 h-4 bg-white ml-0.5 ${cursorVisible ? "opacity-100" : "opacity-0"}`} />
          </div>
        )}

        {/* Cursor al final */}
        {!isTyping && (
          <span className={`inline-block w-2 h-4 bg-gray-300 ml-1 ${cursorVisible ? "opacity-100" : "opacity-0"}`} />
        )}
      </div>

      {/* Scanlines */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.5) 2px, rgba(0,0,0,0.5) 4px)",
        }}
      />

      {/* CRT glow effect */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          boxShadow: "inset 0 0 100px rgba(0,255,255,0.03)",
        }}
      />
    </div>
  )
}
