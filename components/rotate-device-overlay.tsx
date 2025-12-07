"use client"

import { useState, useEffect } from "react"
import { RotateCcw } from "lucide-react"

export default function RotateDeviceOverlay() {
  const [showOverlay, setShowOverlay] = useState(false)

  useEffect(() => {
    const checkOrientation = () => {
      // Solo mostrar en dispositivos móviles con pantalla vertical
      const isMobile = window.innerWidth <= 768
      const isPortrait = window.innerHeight > window.innerWidth
      setShowOverlay(isMobile && isPortrait)
    }

    checkOrientation()
    window.addEventListener("resize", checkOrientation)
    window.addEventListener("orientationchange", checkOrientation)

    return () => {
      window.removeEventListener("resize", checkOrientation)
      window.removeEventListener("orientationchange", checkOrientation)
    }
  }, [])

  if (!showOverlay) return null

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-8">
      <div className="relative mb-8">
        <div className="w-20 h-32 border-4 border-white/30 rounded-xl relative">
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-white/20 rounded-full" />
        </div>
        <RotateCcw
          className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 text-white/60 animate-spin"
          style={{ animationDuration: "2s" }}
        />
      </div>

      <h2 className="text-white text-xl font-bold mb-2 text-center font-mono">Rota tu dispositivo</h2>
      <p className="text-white/50 text-sm text-center font-mono">Para una mejor experiencia, usa el modo horizontal</p>

      {/* CRT scanlines effect */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.5) 2px, rgba(0,0,0,0.5) 4px)",
        }}
      />
    </div>
  )
}
