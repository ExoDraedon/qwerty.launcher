"use client"

import type React from "react"
import { useState } from "react"
import {
  X,
  Monitor,
  Tv,
  Zap,
  AlertTriangle,
  Sparkles,
  Gauge,
  Eye,
  Waves,
  Info,
  Heart,
  Github,
  Twitter,
  Volume2,
  Music,
} from "lucide-react"
import type { VhsIntensity } from "@/app/page"

interface SettingsPanelProps {
  intensity: VhsIntensity
  onIntensityChange: (intensity: VhsIntensity) => void
  onClose: () => void
}

type TabType = "effects" | "audio" | "credits"

const intensityOptions: { value: VhsIntensity; label: string; description: string; icon: React.ReactNode }[] = [
  {
    value: "soft",
    label: "Suave",
    description: "Efectos sutiles",
    icon: <Monitor className="w-4 h-4" />,
  },
  {
    value: "normal",
    label: "Normal",
    description: "Balance ideal",
    icon: <Tv className="w-4 h-4" />,
  },
  {
    value: "strong",
    label: "Fuerte",
    description: "VHS auténtico",
    icon: <Zap className="w-4 h-4" />,
  },
  {
    value: "extreme",
    label: "EXTREMO",
    description: "TV dañada",
    icon: <AlertTriangle className="w-4 h-4" />,
  },
]

const effectIndicators = {
  soft: { scanlines: 1, noise: 1, glitch: 1, vignette: 1 },
  normal: { scanlines: 2, noise: 2, glitch: 2, vignette: 2 },
  strong: { scanlines: 3, noise: 3, glitch: 3, vignette: 3 },
  extreme: { scanlines: 4, noise: 4, glitch: 4, vignette: 4 },
}

export default function SettingsPanel({ intensity, onIntensityChange, onClose }: SettingsPanelProps) {
  const effects = effectIndicators[intensity]
  const [activeTab, setActiveTab] = useState<TabType>("effects")

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-neutral-950/95 border border-white/10 rounded-xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/5 rounded-lg">
              <Sparkles className="w-4 h-4 text-white/70" />
            </div>
            <div>
              <h2 className="text-sm font-medium text-white">Configuración</h2>
              <p className="text-xs text-white/40">Project Rivals Launcher</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <X className="w-4 h-4 text-white/50" />
          </button>
        </div>

        <div className="flex border-b border-white/5">
          <button
            onClick={() => setActiveTab("effects")}
            className={`flex-1 px-4 py-3 text-xs font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === "effects"
                ? "text-white border-b-2 border-white/50 bg-white/5"
                : "text-white/40 hover:text-white/60"
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            Efectos CRT
          </button>
          <button
            onClick={() => setActiveTab("audio")}
            className={`flex-1 px-4 py-3 text-xs font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === "audio"
                ? "text-white border-b-2 border-white/50 bg-white/5"
                : "text-white/40 hover:text-white/60"
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            Audio
          </button>
          <button
            onClick={() => setActiveTab("credits")}
            className={`flex-1 px-4 py-3 text-xs font-medium transition-colors flex items-center justify-center gap-2 ${
              activeTab === "credits"
                ? "text-white border-b-2 border-white/50 bg-white/5"
                : "text-white/40 hover:text-white/60"
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            Créditos
          </button>
        </div>

        {/* Content */}
        <div className="p-5 min-h-[320px]">
          {activeTab === "effects" && (
            <div className="space-y-5">
              {/* Intensity Selection */}
              <div>
                <h3 className="text-xs font-medium text-white/50 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Gauge className="w-3 h-3" />
                  Intensidad
                </h3>
                <div className="grid grid-cols-4 gap-2">
                  {intensityOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => onIntensityChange(option.value)}
                      className={`relative p-3 rounded-lg border transition-all duration-200 flex flex-col items-center gap-2 ${
                        intensity === option.value
                          ? option.value === "extreme"
                            ? "border-white/40 bg-white/10"
                            : "border-white/30 bg-white/5"
                          : "border-white/5 bg-transparent hover:border-white/15 hover:bg-white/5"
                      }`}
                    >
                      <span className={intensity === option.value ? "text-white" : "text-white/40"}>{option.icon}</span>
                      <span
                        className={`text-xs font-medium ${
                          intensity === option.value ? "text-white" : "text-white/60"
                        } ${option.value === "extreme" ? "animate-pulse" : ""}`}
                      >
                        {option.label}
                      </span>
                      {intensity === option.value && (
                        <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-white" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Effect Levels Visualization */}
              <div>
                <h3 className="text-xs font-medium text-white/50 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Eye className="w-3 h-3" />
                  Niveles de Efecto
                </h3>
                <div className="space-y-3">
                  <EffectBar label="Scanlines" icon={<Waves className="w-3 h-3" />} level={effects.scanlines} />
                  <EffectBar label="Ruido" icon={<Sparkles className="w-3 h-3" />} level={effects.noise} />
                  <EffectBar label="Glitch" icon={<Zap className="w-3 h-3" />} level={effects.glitch} />
                  <EffectBar label="Viñeta" icon={<Eye className="w-3 h-3" />} level={effects.vignette} />
                </div>
              </div>

              {/* Current Mode Info */}
              <div
                className={`p-4 rounded-lg border transition-all ${
                  intensity === "extreme" ? "bg-white/5 border-white/20" : "bg-white/[0.02] border-white/5"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${intensity === "extreme" ? "bg-white/10" : "bg-white/5"}`}>
                    {intensityOptions.find((o) => o.value === intensity)?.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {intensity === "soft" && "Modo Suave"}
                      {intensity === "normal" && "Modo Normal"}
                      {intensity === "strong" && "Modo Fuerte"}
                      {intensity === "extreme" && "Modo Extremo"}
                    </p>
                    <p className="text-xs text-white/40 mt-1">
                      {intensity === "soft" && "Efectos mínimos para una experiencia limpia con un toque retro sutil."}
                      {intensity === "normal" && "Balance perfecto entre claridad visual y nostalgia CRT."}
                      {intensity === "strong" && "Experiencia VHS auténtica con distorsión notable."}
                      {intensity === "extreme" &&
                        "Simulación de TV dañada con máxima distorsión y glitches frecuentes."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "audio" && (
            <div className="space-y-5">
              <div className="p-4 rounded-lg border border-white/10 bg-white/[0.02]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-white/5 rounded-lg">
                    <Volume2 className="w-4 h-4 text-white/70" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Música Ambiental</p>
                    <p className="text-xs text-white/40">Soundtrack lo-fi para el launcher</p>
                  </div>
                </div>
                <p className="text-xs text-white/30">
                  Usa el botón de volumen en la esquina superior derecha para activar o silenciar la música.
                </p>
              </div>

              <div className="p-4 rounded-lg border border-white/10 bg-white/[0.02]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-white/5 rounded-lg">
                    <Zap className="w-4 h-4 text-white/70" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Efectos de Sonido</p>
                    <p className="text-xs text-white/40">Sonidos de interfaz CRT</p>
                  </div>
                </div>
                <p className="text-xs text-white/30">
                  Los efectos de sonido del launcher añaden inmersión a la experiencia retro.
                </p>
              </div>
            </div>
          )}

          {activeTab === "credits" && (
            <div className="space-y-5">
              <div className="text-center py-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 border border-white/10 mb-4">
                  <Heart className="w-8 h-8 text-white/50" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Project Rivals</h3>
                <p className="text-xs text-white/40 uppercase tracking-widest">Minecraft Bedrock Launcher</p>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-lg border border-white/10 bg-white/[0.02]">
                  <p className="text-xs text-white/50 uppercase tracking-wider mb-2">Desarrollado por</p>
                  <p className="text-sm font-medium text-white">Tu Nombre Aquí</p>
                </div>

                <div className="p-4 rounded-lg border border-white/10 bg-white/[0.02]">
                  <p className="text-xs text-white/50 uppercase tracking-wider mb-2">Tecnologías</p>
                  <div className="flex flex-wrap gap-2">
                    {["Next.js", "React", "TypeScript", "Tailwind CSS"].map((tech) => (
                      <span
                        key={tech}
                        className="px-2 py-1 text-xs text-white/70 bg-white/5 rounded-md border border-white/10"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-lg border border-white/10 bg-white/[0.02]">
                  <p className="text-xs text-white/50 uppercase tracking-wider mb-3">Redes Sociales</p>
                  <div className="flex gap-3">
                    <a href="#" className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                      <Github className="w-4 h-4 text-white/70" />
                    </a>
                    <a href="#" className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                      <Twitter className="w-4 h-4 text-white/70" />
                    </a>
                  </div>
                </div>
              </div>

              <p className="text-center text-[10px] text-white/20">Versión 2.1.4 • Hecho con ♥ para la comunidad</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-white/5 bg-white/[0.02]">
          <p className="text-[10px] text-white/30 text-center">Los cambios se aplican en tiempo real</p>
        </div>

        {/* Scanlines overlay on panel */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.02]"
          style={{
            background:
              "repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(255,255,255,0.1) 1px, rgba(255,255,255,0.1) 2px)",
          }}
        />
      </div>
    </div>
  )
}

function EffectBar({ label, icon, level }: { label: string; icon: React.ReactNode; level: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-white/40">{icon}</span>
      <span className="text-xs text-white/60 w-16">{label}</span>
      <div className="flex-1 flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all ${
              i <= level ? (level === 4 ? "bg-white/80" : "bg-white/50") : "bg-white/10"
            }`}
          />
        ))}
      </div>
    </div>
  )
}
