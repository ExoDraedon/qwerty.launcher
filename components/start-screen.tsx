"use client"

import { useState, useEffect } from "react"

interface StartScreenProps {
  onStart: () => void
}

export default function StartScreen({ onStart }: StartScreenProps) {
  const [glitch, setGlitch] = useState(false)
  const [flickerOpacity, setFlickerOpacity] = useState(1)

  useEffect(() => {
    const flickerInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        setFlickerOpacity(0.7 + Math.random() * 0.3)
        setTimeout(() => setFlickerOpacity(1), 50 + Math.random() * 100)
      }
    }, 200)

    return () => clearInterval(flickerInterval)
  }, [])

  useEffect(() => {
    const glitchInterval = setInterval(() => {
      if (Math.random() > 0.9) {
        setGlitch(true)
        setTimeout(() => setGlitch(false), 100 + Math.random() * 150)
      }
    }, 500)

    return () => clearInterval(glitchInterval)
  }, [])

  const handleClick = () => {
    setGlitch(true)
    setTimeout(() => {
      setGlitch(false)
      onStart()
    }, 150)
  }

  const asciiLogo = `
  ██████╗ ██╗    ██╗███████╗██████╗ ████████╗██╗   ██╗
 ██╔═══██╗██║    ██║██╔════╝██╔══██╗╚══██╔══╝╚██╗ ██╔╝
 ██║   ██║██║ █╗ ██║█████╗  ██████╔╝   ██║    ╚████╔╝ 
 ██║▄▄ ██║██║███╗██║██╔══╝  ██╔══██╗   ██║     ╚██╔╝  
 ╚██████╔╝╚███╔███╔╝███████╗██║  ██║   ██║      ██║   
  ╚══▀▀═╝  ╚══╝╚══╝ ╚══════╝╚═╝  ╚═╝   ╚═╝      ╚═╝   
`

  return (
    <div
      className="fixed inset-0 bg-black flex flex-col items-center justify-center cursor-pointer select-none"
      onClick={handleClick}
      style={{ opacity: flickerOpacity }}
    >
      {/* Ruido de fondo */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Scanlines */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.4) 2px, rgba(0,0,0,0.4) 4px)",
        }}
      />

      {/* Logo ASCII animado */}
      <div
        className={`font-mono text-cyan-400 text-center transition-all duration-75 ${glitch ? "translate-x-1 skew-x-2" : ""}`}
        style={{
          textShadow: glitch
            ? "2px 0 #ff0000, -2px 0 #00ff00"
            : "0 0 20px rgba(0,255,255,0.5), 0 0 40px rgba(0,255,255,0.3)",
        }}
      >
        <pre className="text-[8px] sm:text-[10px] md:text-xs leading-tight">{asciiLogo}</pre>
      </div>

      {/* Texto de instruccion */}
      <div className="mt-12 flex flex-col items-center gap-4">
        <div
          className={`text-white/90 text-lg md:text-xl font-mono tracking-widest animate-pulse ${glitch ? "text-red-400" : ""}`}
          style={{
            textShadow: "0 0 10px rgba(255,255,255,0.5)",
          }}
        >
          {"[ CLICK PARA INICIAR ]"}
        </div>

        <div className="text-gray-500 text-xs font-mono mt-2">v3.0.0 BETA</div>
      </div>

      {/* Lineas decorativas animadas */}
      <div className="absolute bottom-20 left-0 right-0 flex justify-center">
        <div className="w-64 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent animate-pulse" />
      </div>

      {/* Efecto de glitch overlay */}
      {glitch && (
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute inset-0 bg-cyan-400/10"
            style={{
              clipPath: `inset(${Math.random() * 100}% 0 ${Math.random() * 100}% 0)`,
            }}
          />
          <div
            className="absolute inset-0 bg-red-400/10"
            style={{
              clipPath: `inset(${Math.random() * 100}% 0 ${Math.random() * 100}% 0)`,
              transform: `translateX(${Math.random() * 10 - 5}px)`,
            }}
          />
        </div>
      )}

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, transparent 0%, transparent 50%, rgba(0,0,0,0.8) 100%)",
        }}
      />

      {/* CRT curve effect */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          boxShadow: "inset 0 0 100px rgba(0,0,0,0.5)",
          borderRadius: "10px",
        }}
      />
    </div>
  )
}
