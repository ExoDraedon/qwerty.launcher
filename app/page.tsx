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
  ip: "server.cprot.net",
  port: 25570,
  name: "Project Rivals",
}

export type VhsIntensity = "soft" | "normal" | "strong" | "extreme"

export default function Home() {
  const [loadingComplete, setLoadingComplete] = useState(false)
  const [tvTurnedOn, setTvTurnedOn] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [vhsIntensity, setVhsIntensity] = useState<VhsIntensity>("normal")
  const [isConnecting, setIsConnecting] = useState(false)

  const handleLoadingComplete = () => {
    setLoadingComplete(true)
    setTimeout(() => setTvTurnedOn(true), 100)
  }

  const handleProjectRivalsClick = () => {
    if (isConnecting) return

    setIsConnecting(true)
    const { ip, port } = SERVER_CONFIG

    // Abrir Minecraft con el protocolo minecraft://
    const minecraftUrl = `minecraft://connect/?serverUrl=${ip}&serverPort=${port}`
    window.location.href = minecraftUrl

    // Resetear estado despues de 3 segundos
    setTimeout(() => {
      setIsConnecting(false)
    }, 3000)
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
    </div>
  )
}
