"use client"

import { useState } from "react"
import CmdLoader from "@/components/cmd-loader"
import MainScreen from "@/components/main-screen"
import SettingsPanel from "@/components/settings-panel"
import RotateDeviceOverlay from "@/components/rotate-device-overlay"

// ==========================================
// CONFIGURA TU IMAGEN DE FONDO AQUI
// ==========================================
const BACKGROUND_IMAGE = "/dark-cyberpunk-city-neon-lights.jpg"

// ==========================================
// CONFIGURA EL SERVIDOR AQUI
// ==========================================
const SERVER_CONFIG = {
  ip: "projectrivalsbedrock.exaroton.me",
  port: 24565,
  name: "Project Rivals",
}

export type VhsIntensity = "soft" | "normal" | "strong" | "extreme"

export default function Home() {
  const [loadingComplete, setLoadingComplete] = useState(false)
  const [tvTurnedOn, setTvTurnedOn] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [vhsIntensity, setVhsIntensity] = useState<VhsIntensity>("normal")
  const [isConnecting, setIsConnecting] = useState(false)
  const [showConnectionModal, setShowConnectionModal] = useState(false)

  const handleLoadingComplete = () => {
    setLoadingComplete(true)
    setTimeout(() => setTvTurnedOn(true), 100)
  }

  const handleProjectRivalsClick = () => {
    if (isConnecting) return
    setShowConnectionModal(true)
  }

  const connectToServer = (method: "direct" | "copy") => {
    const { ip, port, name } = SERVER_CONFIG

    if (method === "copy") {
      // Copiar IP al portapapeles
      navigator.clipboard.writeText(`${ip}:${port}`)
      alert(`IP copiada: ${ip}:${port}\n\nAbre Minecraft > Jugar > Servidores > Agregar servidor`)
      setShowConnectionModal(false)
      return
    }

    setIsConnecting(true)
    setShowConnectionModal(false)

    // Metodo 1: Protocolo directo de Minecraft Bedrock
    const connectUrl = `minecraft://?addExternalServer=${encodeURIComponent(name)}|${ip}:${port}`

    // Intentar abrir Minecraft
    window.location.href = connectUrl

    // Fallback: si no funciona en 2 segundos, mostrar instrucciones
    setTimeout(() => {
      setIsConnecting(false)
    }, 5000)
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      <RotateDeviceOverlay />

      {!loadingComplete ? (
        <CmdLoader onComplete={handleLoadingComplete} />
      ) : (
        <MainScreen
          tvTurnedOn={tvTurnedOn}
          vhsIntensity={vhsIntensity}
          backgroundImage={BACKGROUND_IMAGE}
          onSettingsClick={() => setShowSettings(true)}
          onProjectRivalsClick={handleProjectRivalsClick}
          isConnecting={isConnecting}
          serverName={SERVER_CONFIG.name}
        />
      )}

      {showSettings && (
        <SettingsPanel
          intensity={vhsIntensity}
          onIntensityChange={setVhsIntensity}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* Modal de conexion */}
      {showConnectionModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="relative bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
            {/* Scanlines del modal */}
            <div
              className="absolute inset-0 pointer-events-none rounded-lg opacity-10"
              style={{
                background:
                  "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)",
              }}
            />

            <h2 className="text-xl font-bold text-white mb-2 text-center">Conectar a {SERVER_CONFIG.name}</h2>
            <p className="text-gray-400 text-sm text-center mb-6">
              {SERVER_CONFIG.ip}:{SERVER_CONFIG.port}
            </p>

            <div className="space-y-3">
              {/* Boton conectar directo */}
              <button
                onClick={() => connectToServer("direct")}
                className="w-full py-3 px-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Abrir Minecraft y Conectar
              </button>

              {/* Boton copiar IP */}
              <button
                onClick={() => connectToServer("copy")}
                className="w-full py-3 px-4 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                  />
                </svg>
                Copiar IP al portapapeles
              </button>

              {/* Instrucciones */}
              <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
                <p className="text-xs text-gray-400 text-center">
                  Si "Abrir Minecraft" no funciona, copia la IP y agregala manualmente en:
                  <br />
                  <span className="text-gray-300">
                    Minecraft {">"} Jugar {">"} Servidores {">"} Agregar servidor
                  </span>
                </p>
              </div>
            </div>

            {/* Boton cerrar */}
            <button
              onClick={() => setShowConnectionModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
