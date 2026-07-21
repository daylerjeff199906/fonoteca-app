"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { changeOwnPassword } from "@/actions/system-users"
import { showToast } from "@/lib/toast"
import { BackendUser } from "@/lib/backend/auth"

export function ProfileClient({ user }: { user: BackendUser | null }) {
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isSaving, setIsSaving] = useState(false)

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

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Datos del Perfil */}
      <Card>
        <CardHeader>
          <CardTitle>Datos Personales</CardTitle>
          <CardDescription>Información básica de tu cuenta en el sistema.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label className="text-muted-foreground text-xs">Nombre</Label>
            <p className="font-medium">{user?.name || "No definido"}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-muted-foreground text-xs">Correo Electrónico</Label>
            <p className="font-medium">{user?.email || "No definido"}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-muted-foreground text-xs">Rol Principal</Label>
            <p className="font-medium">{user?.role || "USER"}</p>
          </div>
        </CardContent>
      </Card>

      {/* Cambiar Contraseña */}
      <Card>
        <CardHeader>
          <CardTitle>Cambiar Contraseña</CardTitle>
          <CardDescription>Actualiza tu contraseña. Usa una combinación segura de al menos 12 caracteres.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
              <Label htmlFor="newPassword">Nueva Contraseña (Mínimo 12 caracteres)</Label>
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
        </CardContent>
      </Card>
    </div>
  )
}
