"use client"

import { useState } from "react"
import CmdLoader from "@/components/cmd-loader"
import MainScreen from "@/components/main-screen"
import SettingsPanel from "@/components/settings-panel"
import RotateDeviceOverlay from "@/components/rotate-device-overlay"

// ==========================================
// CONFIGURA TU IMAGEN DE FONDO AQUI
// ==========================================
const BACKGROUND_IMAGE = "/back.png"

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

  const handleLoadingComplete = () => {
    setLoadingComplete(true)
    setTimeout(() => setTvTurnedOn(true), 100)
  }

  const handleProjectRivalsClick = () => {
    if (isConnecting) return

    setIsConnecting(true)
    const { ip, port } = SERVER_CONFIG

    // Primero intenta abrir con el protocolo de servidor directo
    const minecraftUrl = `minecraft://?addExternalServer=${encodeURIComponent(SERVER_CONFIG.name)}|${ip}:${port}`

    // Crear un iframe oculto para intentar abrir Minecraft
    const iframe = document.createElement("iframe")
    iframe.style.display = "none"
    iframe.src = minecraftUrl
    document.body.appendChild(iframe)

    // Tambien intentar con window.location como fallback
    setTimeout(() => {
      window.location.href = minecraftUrl
    }, 100)

    // Limpiar iframe despues de 2 segundos
    setTimeout(() => {
      document.body.removeChild(iframe)
    }, 2000)

    // Resetear estado despues de 5 segundos
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
    </div>
  )
}
