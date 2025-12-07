"use client"

import { useState, useEffect, useRef } from "react"

interface CmdLoaderProps {
  onComplete: () => void
}

const cmdLines = [
  { text: "Microsoft Windows [Version 10.0.22631.4460]", delay: 0 },
  { text: "(c) Microsoft Corporation. All rights reserved.", delay: 150 },
  { text: "", delay: 300 },
  { text: "C:\\Users\\Player> cd ProjectRivals", delay: 600 },
  { text: "C:\\Users\\Player\\ProjectRivals> launcher.exe --init", delay: 1000 },
  { text: "", delay: 1200 },
  { text: "╔══════════════════════════════════════════════════════════════╗", delay: 1400 },
  { text: "║       PROJECT RIVALS - MINECRAFT BEDROCK LAUNCHER           ║", delay: 1600 },
  { text: "║                     Version 2.1.4                           ║", delay: 1800 },
  { text: "╚══════════════════════════════════════════════════════════════╝", delay: 2000 },
  { text: "", delay: 2200 },
  { text: "[SYSTEM] Initializing launcher components...", delay: 2500 },
  { text: "[OK] Core modules loaded successfully", delay: 3000 },
  { text: "[SYSTEM] Checking for updates...", delay: 3500 },
  { text: "[OK] Launcher is up to date", delay: 4000 },
  { text: "", delay: 4200 },
  { text: "[NETWORK] Establishing secure connection...", delay: 4500 },
  { text: "[OK] Connected to Project Rivals servers", delay: 5200 },
  { text: "[NETWORK] Verifying server status...", delay: 5800 },
  { text: "[OK] Server online - 127 players connected", delay: 6400 },
  { text: "", delay: 6700 },
  { text: "Loading resources:", delay: 7000 },
  { text: "  [████████████████████████████████████████] 100%  textures.pak", delay: 7500 },
  { text: "  [████████████████████████████████████████] 100%  sounds.pak", delay: 8000 },
  { text: "  [████████████████████████████████████████] 100%  scripts.pak", delay: 8500 },
  { text: "  [████████████████████████████████████████] 100%  shaders.pak", delay: 9000 },
  { text: "", delay: 9300 },
  { text: "[DISPLAY] Initializing VHS display driver...", delay: 9600 },
  { text: "[OK] CRT emulation active", delay: 10100 },
  { text: "[OK] Scanline overlay enabled", delay: 10400 },
  { text: "[OK] Retro filters applied", delay: 10700 },
  { text: "", delay: 11000 },
  { text: "[AUDIO] Loading ambient soundtrack...", delay: 11300 },
  { text: "[OK] Audio subsystem ready", delay: 11700 },
  { text: "", delay: 12000 },
  { text: "═══════════════════════════════════════════════════════════════", delay: 12300 },
  { text: "  ALL SYSTEMS OPERATIONAL - READY TO LAUNCH", delay: 12600 },
  { text: "═══════════════════════════════════════════════════════════════", delay: 12900 },
  { text: "", delay: 13200 },
  { text: ">> POWERING ON DISPLAY...", delay: 13500 },
]

export default function CmdLoader({ onComplete }: CmdLoaderProps) {
  const [visibleLines, setVisibleLines] = useState<string[]>([])
  const [cursorVisible, setCursorVisible] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timers: NodeJS.Timeout[] = []

    cmdLines.forEach((line) => {
      const timer = setTimeout(() => {
        setVisibleLines((prev) => [...prev, line.text])
      }, line.delay)
      timers.push(timer)
    })

    const completeTimer = setTimeout(() => {
      onComplete()
    }, 14500)
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
  }, [visibleLines])

  return (
    <div className="fixed inset-0 bg-[#0c0c0c] flex flex-col">
      {/* Barra de título estilo Windows */}
      <div className="bg-[#000000] px-2 py-1 flex items-center justify-between border-b border-[#333] shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 flex items-center justify-center">
            <span className="text-[10px] text-gray-400">■</span>
          </div>
          <span className="text-gray-300 text-xs font-mono">C:\Users\Player\ProjectRivals\launcher.exe</span>
        </div>
        <div className="flex items-center">
          <div className="px-3 py-0.5 hover:bg-gray-700 text-gray-400 text-xs cursor-default">─</div>
          <div className="px-3 py-0.5 hover:bg-gray-700 text-gray-400 text-xs cursor-default">□</div>
          <div className="px-3 py-0.5 hover:bg-red-600 text-gray-400 text-xs cursor-default">×</div>
        </div>
      </div>

      {/* Contenido CMD fullscreen */}
      <div
        ref={containerRef}
        className="flex-1 p-4 overflow-y-auto font-mono text-sm leading-relaxed"
        style={{
          background: "linear-gradient(180deg, #0c0c0c 0%, #0a0a0a 100%)",
        }}
      >
        {visibleLines.map((line, index) => (
          <div
            key={index}
            className={`whitespace-pre ${
              line.includes("ALL SYSTEMS") || line.includes("READY")
                ? "text-green-400 font-bold"
                : line.includes(">>")
                  ? "text-cyan-400 animate-pulse"
                  : line.includes("[OK]")
                    ? "text-green-400"
                    : line.includes("████")
                      ? "text-yellow-300"
                      : line.includes("[SYSTEM]") ||
                          line.includes("[NETWORK]") ||
                          line.includes("[DISPLAY]") ||
                          line.includes("[AUDIO]")
                        ? "text-cyan-300"
                        : line.includes("╔") || line.includes("║") || line.includes("╚") || line.includes("═")
                          ? "text-white font-bold"
                          : line.includes("PROJECT RIVALS")
                            ? "text-cyan-400 font-bold"
                            : "text-gray-300"
            }`}
          >
            {line || "\u00A0"}
          </div>
        ))}
        <span className={`inline-block w-2 h-4 bg-gray-300 ml-1 ${cursorVisible ? "opacity-100" : "opacity-0"}`} />
      </div>

      {/* Efecto de scanlines sobre el CMD */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.5) 2px, rgba(0,0,0,0.5) 4px)",
        }}
      />
    </div>
  )
}
