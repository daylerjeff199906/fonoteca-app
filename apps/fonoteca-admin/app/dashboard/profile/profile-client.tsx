"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { changeOwnPassword } from "@/actions/system-users"
import { showToast } from "@/lib/toast"
import { BackendUser } from "@/lib/backend/auth"
import { setupMfaAction, enableMfaAction } from "@/actions/auth"
import { QRCodeSVG } from "qrcode.react"

export function ProfileClient({ user }: { user: BackendUser | null }) {
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  // MFA States
  const [mfaData, setMfaData] = useState<{ secret: string; qrCodeUrl: string } | null>(null)
  const [mfaCode, setMfaCode] = useState("")
  const [isConfiguringMfa, setIsConfiguringMfa] = useState(false)
  const [mfaSuccess, setMfaSuccess] = useState(false)

  const handleSetupMfa = async () => {
    setIsConfiguringMfa(true)
    try {
      const res = await setupMfaAction()
      if (res.success && res.data) {
        setMfaData(res.data)
      } else {
        showToast.error("Error", res.error)
      }
    } catch (error) {
      showToast.error("Error", "Ocurrió un error al iniciar MFA.")
    } finally {
      setIsConfiguringMfa(false)
    }
  }

  const handleEnableMfa = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsConfiguringMfa(true)
    try {
      const res = await enableMfaAction(mfaCode)
      if (res.success) {
        showToast.success("MFA Activado", "Autenticación de dos factores configurada exitosamente.")
        setMfaSuccess(true)
      } else {
        showToast.error("Error", res.error)
      }
    } catch (error) {
      showToast.error("Error", "Ocurrió un error al verificar el código MFA.")
    } finally {
      setIsConfiguringMfa(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword.length < 12) {
      showToast.error("Contraseña insegura", "La nueva contraseña debe tener al menos 12 caracteres.")
      return
    }

    if (newPassword !== confirmPassword) {
      showToast.error("Error", "Las contraseñas no coinciden.")
      return
    }

    setIsSaving(true)
    try {
      const res = await changeOwnPassword({ oldPassword, newPassword })
      if (res.success) {
        showToast.success("Contraseña actualizada", "Tu contraseña ha sido cambiada exitosamente.")
        setOldPassword("")
        setNewPassword("")
        setConfirmPassword("")
      } else {
        showToast.error("Error", res.error)
      }
    } catch (error) {
      showToast.error("Error", "Ocurrió un error inesperado al intentar cambiar la contraseña.")
    } finally {
      setIsSaving(false)
    }
  }

  const [activeSection, setActiveSection] = useState("datos-personales")

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      { rootMargin: "-100px 0px -60% 0px" }
    )
    const sections = ["datos-personales", "seguridad", "mfa"]
    sections.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  const scrollTo = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <div className="flex flex-col md:flex-row gap-10 mt-6 relative items-start">
      {/* Aside Menu */}
      <aside className="w-full md:w-64 shrink-0 md:sticky md:top-24 hidden md:block">
        <nav className="flex flex-col gap-1">
          <button 
            onClick={() => scrollTo('datos-personales')} 
            className={cn("text-left px-3 py-2 text-sm font-medium rounded-md transition-colors", activeSection === 'datos-personales' ? "bg-primary/10 text-primary" : "hover:bg-muted text-muted-foreground hover:text-foreground")}
          >
            Datos Personales
          </button>
          <button 
            onClick={() => scrollTo('seguridad')} 
            className={cn("text-left px-3 py-2 text-sm font-medium rounded-md transition-colors", activeSection === 'seguridad' ? "bg-primary/10 text-primary" : "hover:bg-muted text-muted-foreground hover:text-foreground")}
          >
            Seguridad y Contraseña
          </button>
          <button 
            onClick={() => scrollTo('mfa')} 
            className={cn("text-left px-3 py-2 text-sm font-medium rounded-md transition-colors", activeSection === 'mfa' ? "bg-primary/10 text-primary" : "hover:bg-muted text-muted-foreground hover:text-foreground")}
          >
            Autenticación de Dos Factores
          </button>
        </nav>
      </aside>

      {/* Content */}
      <div className="flex-1 max-w-3xl space-y-16 pb-20">
        
        {/* Section: Datos Personales */}
        <section id="datos-personales" className="space-y-6 scroll-mt-28">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Datos Personales</h2>
            <p className="text-sm text-muted-foreground mt-1">Información básica de tu cuenta en el sistema.</p>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-muted-foreground text-xs uppercase tracking-wider">Nombre</Label>
              <p className="font-medium">{user?.name || "No definido"}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-muted-foreground text-xs uppercase tracking-wider">Correo Electrónico</Label>
              <p className="font-medium">{user?.email || "No definido"}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-muted-foreground text-xs uppercase tracking-wider">Rol Principal</Label>
              <p className="font-medium">{user?.role || "USER"}</p>
            </div>
          </div>
        </section>

        <hr className="border-border" />

        {/* Section: Seguridad y Contraseña */}
        <section id="seguridad" className="space-y-6 scroll-mt-28">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Seguridad y Contraseña</h2>
            <p className="text-sm text-muted-foreground mt-1">Actualiza tu contraseña usando una combinación segura de al menos 12 caracteres.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
            <div className="space-y-2">
              <Label htmlFor="oldPassword">Contraseña Actual</Label>
              <Input
                id="oldPassword"
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nueva Contraseña</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={12}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Nueva Contraseña</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={12}
              />
            </div>
            <Button type="submit" disabled={isSaving || !oldPassword || !newPassword || !confirmPassword}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Actualizar Contraseña
            </Button>
          </form>
        </section>

        <hr className="border-border" />

        {/* Section: MFA */}
        <section id="mfa" className="space-y-6 scroll-mt-28">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Autenticación de Dos Factores (MFA)</h2>
            <p className="text-sm text-muted-foreground mt-1">Añade una capa extra de seguridad a tu cuenta configurando un autenticador (TOTP).</p>
          </div>
          
          <div className="max-w-2xl">
            {!mfaData && !mfaSuccess && (
              <Button onClick={handleSetupMfa} disabled={isConfiguringMfa} variant="outline">
                {isConfiguringMfa && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Configurar Autenticador
              </Button>
            )}

            {mfaSuccess && (
              <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-700 dark:text-emerald-400">
                <p className="font-semibold text-sm">¡Autenticación de dos factores activada correctamente!</p>
                <p className="text-xs mt-1">A partir de ahora, se te pedirá un código de tu aplicación autenticadora al iniciar sesión.</p>
              </div>
            )}

            {mfaData && !mfaSuccess && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  <div className="bg-white p-4 rounded-md shadow-sm border w-fit">
                    <QRCodeSVG value={mfaData.qrCodeUrl} size={150} level="M" />
                  </div>
                  <div className="space-y-4 max-w-sm">
                    <div>
                      <h4 className="font-semibold text-sm">1. Escanea el código QR</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Abre tu aplicación autenticadora (ej. Google Authenticator, Authy) y escanea el código QR de la izquierda.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">2. Ingresa el código de 6 dígitos</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Introduce el código generado por la aplicación para verificar y activar el MFA.
                      </p>
                    </div>
                    <form onSubmit={handleEnableMfa} className="flex gap-2 items-end mt-4">
                      <div className="flex-1 space-y-2">
                        <Label htmlFor="mfaCode" className="sr-only">Código MFA</Label>
                        <Input
                          id="mfaCode"
                          type="text"
                          placeholder="123456"
                          value={mfaCode}
                          onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          required
                          minLength={6}
                          maxLength={6}
                          className="font-mono text-center tracking-widest text-lg h-11"
                        />
                      </div>
                      <Button type="submit" disabled={mfaCode.length !== 6 || isConfiguringMfa} className="h-11">
                        {isConfiguringMfa ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verificar"}
                      </Button>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  )
}
