"use client"

import { DataTableCard, TableEmptyRow } from "@/components/panel-admin/data-table";
import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter
} from "@/components/ui/sheet"
import {
  KeyRound,
  Edit,
  Plus,
  Loader2,
  Trash2,
  ShieldHalf,
  Copy,
  Download,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { SearchInput } from "@/components/dashboard/search-input"
import { PaginationButtons } from "@/components/dashboard/pagination-buttons"
import {
  createSystemUser,
  updateSystemUser,
  deleteSystemUser,
  changeUserRole,
  resetSystemPassword
} from "@/actions/system-users"
import {
  ROLE_HIERARCHY,
  ROLE_INFO,
  assignableRoles,
  canManageAccount,
  canManageUsers,
  effectiveRole,
  effectiveRoleLabel,
  redundantRoles,
  roleLabel,
  unknownRoles,
  usersHelpText,
  type RoleCode,
} from "@/lib/roles"
import { isLikelyTestAccount } from "@/lib/user-audit"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { showToast } from "@/lib/toast"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

interface UserRole {
  roles?: {
    id: string
    code: string
    name: string
  }
}

interface SystemUser {
  id: string
  email: string
  name: string
  created_at: string
  roles?: Array<{ code: string; name: string }>
  user_roles?: UserRole[]
}

interface SystemUsersClientProps {
  initialUsers: SystemUser[]
  totalCount: number
  /** Persona autenticada: define qué acciones se ofrecen. */
  actor: { id: string; roles: string[] }
}

function assignedRoleCodes(user?: SystemUser | null) {
  return user?.roles?.map((role) => role.code)
    ?? user?.user_roles?.map((entry) => entry.roles?.code).filter((code): code is string => Boolean(code))
    ?? []
}

export function SystemUsersClient({
  initialUsers,
  totalCount,
  actor,
}: SystemUsersClientProps) {
  const router = useRouter()
  const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null)
  const activeUser = selectedUser ? initialUsers.find(u => u.id === selectedUser.id) || selectedUser : null
  const [generatedPassword, setGeneratedPassword] = useState<{ email: string, password: string } | null>(null)

  // Dialogs state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isRolesSheetOpen, setIsRolesSheetOpen] = useState(false)
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false)
  const [isResetAlertOpen, setIsResetAlertOpen] = useState(false)

  // Loaders
  const [isSaving, setIsSaving] = useState(false)
  const [pendingRole, setPendingRole] = useState<RoleCode | null>(null)
  const [isRoleConfirmOpen, setIsRoleConfirmOpen] = useState(false)
  const [isChangingRole, setIsChangingRole] = useState(false)

  const allowedRoles = assignableRoles(actor.roles)
  const mayManageUsers = canManageUsers(actor.roles)
  const checkTarget = (user: SystemUser) =>
    canManageAccount({ actorId: actor.id, actorRoles: actor.roles, targetId: user.id, targetRoles: assignedRoleCodes(user) })

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    roles: ["VIEWER"] as string[]
  })

  const openCreate = () => {
    setFormData({ name: "", email: "", roles: [allowedRoles.includes("VIEWER") ? "VIEWER" : (allowedRoles[0] ?? "VIEWER")] })
    setIsCreateDialogOpen(true)
  }

  const openEdit = (user: SystemUser) => {
    setSelectedUser(user)
    setFormData({ name: user.name, email: user.email, roles: assignedRoleCodes(user) })
    setIsEditDialogOpen(true)
  }

  const openRoles = (user: SystemUser) => {
    setSelectedUser(user)
    setPendingRole(effectiveRole(assignedRoleCodes(user)))
    setIsRolesSheetOpen(true)
  }

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.roles.length) {
      showToast.error("Seleccione un rol", "Cada usuario debe tener un rol asignado.")
      return
    }
    setIsSaving(true)

    try {
      if (isEditDialogOpen && selectedUser) {
        const res = await updateSystemUser(selectedUser.id, formData)
        if (res.success) {
          showToast.success("Usuario actualizado", "Los datos se han guardado exitosamente.")
          setIsEditDialogOpen(false)
        } else {
          showToast.error("Error", res.error)
        }
      } else {
        const res = await createSystemUser(formData)
        if (res.success) {
          showToast.success("Usuario creado", "Se ha enviado un correo con la contraseña temporal al usuario.")
          setIsCreateDialogOpen(false)
          if (res.data?.tempPassword) {
            setGeneratedPassword({ email: formData.email, password: res.data.tempPassword })
          }
        } else {
          showToast.error("Error", res.error)
        }
      }
      router.refresh()
    } catch (error) {
      showToast.error("Error", "Ocurrió un error inesperado.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedUser) return
    try {
      const res = await deleteSystemUser(selectedUser.id)
      if (res.success) {
        showToast.success("Usuario eliminado", "El usuario ha sido borrado del sistema.")
        setIsDeleteAlertOpen(false)
        router.refresh()
      } else {
        showToast.error("Error", res.error)
      }
    } catch (error) {
      showToast.error("Error", "Ocurrió un error inesperado.")
    }
  }

  const handleResetPassword = async () => {
    if (!selectedUser) return
    try {
      const res = await resetSystemPassword(selectedUser.id)
      if (res.success) {
        showToast.success("Contraseña restablecida", "Se ha enviado un correo con la nueva contraseña temporal al usuario.")
        setIsResetAlertOpen(false)
        if (res.data?.tempPassword) {
          setGeneratedPassword({ email: selectedUser.email, password: res.data.tempPassword })
        }
      } else {
        showToast.error("Error", res.error)
      }
    } catch (error) {
      showToast.error("Error", "Ocurrió un error inesperado.")
    }
  }

  const handleConfirmRoleChange = async () => {
    if (!selectedUser || !pendingRole) return
    setIsChangingRole(true)
    try {
      const res = await changeUserRole(selectedUser.id, pendingRole)
      if (res.success) {
        showToast.success(
          res.unchanged ? "Sin cambios" : "Rol actualizado",
          res.unchanged ? "La persona ya tenía ese rol." : `Ahora tiene el rol ${ROLE_INFO[pendingRole].name}. El cambio quedó registrado en la auditoría.`
        )
        setIsRoleConfirmOpen(false)
        setIsRolesSheetOpen(false)
        router.refresh()
      } else {
        showToast.error("No se pudo cambiar el rol", res.error)
      }
    } catch (error) {
      showToast.error("Error", "Ocurrió un error inesperado al actualizar el rol.")
    } finally {
      setIsChangingRole(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1 max-w-sm">
          <SearchInput placeholder="Buscar por nombre o correo..." />
        </div>

        {mayManageUsers && (
          <Button className="gap-2 h-9" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Crear usuario
          </Button>
        )}
      </div>
      <p className="text-sm text-muted-foreground">{usersHelpText(actor.roles)}</p>

      <DataTableCard>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-bold">Usuario</TableHead>
              <TableHead className="font-bold">Rol</TableHead>
              <TableHead className="text-right font-bold">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialUsers.length > 0 ? (
              initialUsers.map((user) => {
                const assignedRoles = assignedRoleCodes(user)
                const top = effectiveRole(assignedRoles)
                const manage = checkTarget(user)

                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 border">
                          <AvatarFallback className="bg-primary/5 text-primary text-xs">
                            {user.name?.[0]?.toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0">
                          <span className="font-semibold text-sm whitespace-nowrap">
                            {user.name}
                          </span>
                          <span className="text-[10px] text-muted-foreground truncate">
                            {user.email}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Badge
                            variant="secondary"
                            title={top ? ROLE_INFO[top].description : undefined}
                            className="text-[10px] py-0 px-1.5 font-semibold bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800"
                          >
                            {effectiveRoleLabel(assignedRoles)}
                          </Badge>
                          {unknownRoles(assignedRoles).map((code) => (
                            <Badge key={code} variant="outline" className="text-[10px] py-0 px-1.5">{roleLabel(code)}</Badge>
                          ))}
                          {mayManageUsers && isLikelyTestAccount({ id: user.id, email: user.email, name: user.name, roles: assignedRoles }) && (
                            <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-amber-300 text-amber-700">Posible cuenta de prueba</Badge>
                          )}
                          {user.id === actor.id && <span className="text-[10px] text-muted-foreground">(usted)</span>}
                        </div>
                        {redundantRoles(assignedRoles).length > 0 && (
                          <span className="text-[10px] text-muted-foreground">
                            Incluye los permisos de {redundantRoles(assignedRoles).map(roleLabel).join(" y ")}.
                          </span>
                        )}
                        {assignedRoles.length === 0 && <span className="text-xs text-muted-foreground italic">Sin rol asignado</span>}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {manage.allowed ? (
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openRoles(user)} title="Gestionar rol" aria-label={`Gestionar rol de ${user.name}`}>
                            <ShieldHalf className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelectedUser(user); setIsResetAlertOpen(true) }} title="Restablecer contraseña" aria-label={`Restablecer la contraseña de ${user.name}`}>
                            <KeyRound className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(user)} title="Editar usuario" aria-label={`Editar a ${user.name}`}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => { setSelectedUser(user); setIsDeleteAlertOpen(true) }} title="Eliminar usuario" aria-label={`Eliminar a ${user.name}`}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground" title={manage.reason}>Solo lectura</span>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableEmptyRow colSpan={4} title="No se encontraron usuarios." description="Ajuste la búsqueda o los filtros."  />
            )}
          </TableBody>
        </Table>
      </DataTableCard>

      <PaginationButtons totalCount={totalCount} itemLabel="Usuarios" />

      {/* CREATE / EDIT DIALOG */}
      <Dialog open={isCreateDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateDialogOpen(false)
          setIsEditDialogOpen(false)
        }
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{isEditDialogOpen ? "Editar usuario" : "Crear nuevo usuario"}</DialogTitle>
            <DialogDescription>
              {isEditDialogOpen
                ? "Modifique los datos básicos del usuario."
                : "Se generará una contraseña temporal que será enviada al correo proporcionado."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveUser} className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            {isEditDialogOpen ? (
              <p className="text-xs text-muted-foreground">
                Para cambiar el rol use «Gestionar rol» en la lista: el cambio pide confirmación y queda auditado.
              </p>
            ) : (
              <fieldset className="grid gap-2">
                <legend className="mb-1 text-sm font-medium">Rol</legend>
                <div className="grid gap-2 rounded-md border p-3">
                  {ROLE_HIERARCHY.filter((code) => allowedRoles.includes(code)).map((code) => (
                    <label key={code} className="flex items-start gap-2 text-sm">
                      <input
                        type="radio"
                        name="new-user-role"
                        className="mt-1"
                        checked={formData.roles[0] === code}
                        onChange={() => setFormData({ ...formData, roles: [code] })}
                      />
                      <span>
                        <span className="font-medium">{ROLE_INFO[code].name}</span>
                        <span className="block text-xs text-muted-foreground">{ROLE_INFO[code].description}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
            )}
            <DialogFooter className="pt-4">
              <Button type="button" variant="ghost" onClick={() => {
                setIsCreateDialogOpen(false)
                setIsEditDialogOpen(false)
              }}>Cancelar</Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditDialogOpen ? "Guardar cambios" : "Crear usuario"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DELETE ALERT */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">Eliminar usuario</AlertDialogTitle>
            <AlertDialogDescription>
              Está a punto de eliminar permanentemente al usuario <strong>{selectedUser?.name}</strong>. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Sí, eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* RESET PASSWORD ALERT */}
      <AlertDialog open={isResetAlertOpen} onOpenChange={setIsResetAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restablecer contraseña</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Seguro que desea restablecer la contraseña de <strong>{selectedUser?.name}</strong>?
              Se generará una nueva contraseña temporal y será enviada a <strong>{selectedUser?.email}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetPassword}>
              Sí, restablecer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ROLE SHEET + CONFIRMATION */}
      <Sheet open={isRolesSheetOpen} onOpenChange={setIsRolesSheetOpen}>
        <SheetContent className="sm:max-w-md py-0 px-4">
          <SheetHeader className="space-y-1 mt-6">
            <SheetTitle>Gestionar rol</SheetTitle>
            <SheetDescription>
              Rol principal de <strong>{activeUser?.name}</strong>. Cada rol incluye los permisos de los inferiores, por eso solo se asigna uno.
            </SheetDescription>
          </SheetHeader>

          <fieldset className="mt-6 grid gap-3">
            <legend className="sr-only">Rol principal</legend>
            {ROLE_HIERARCHY.filter((code) => allowedRoles.includes(code)).map((code) => {
              const current = effectiveRole(assignedRoleCodes(activeUser)) === code
              return (
                <label
                  key={code}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-md border p-3 transition-colors",
                    pendingRole === code ? "border-emerald-300 bg-emerald-50/50 dark:bg-emerald-900/10" : "hover:bg-muted/40"
                  )}
                >
                  <input type="radio" name="user-role" className="mt-1" checked={pendingRole === code} onChange={() => setPendingRole(code)} />
                  <span className="flex flex-col gap-0.5">
                    <span className="flex items-center gap-2 text-sm font-semibold">
                      {ROLE_INFO[code].name}
                      {current && <Badge className="h-4 border-none bg-emerald-500 px-1 text-[8px] font-bold uppercase">Actual</Badge>}
                    </span>
                    <span className="text-xs text-muted-foreground">{ROLE_INFO[code].description}</span>
                  </span>
                </label>
              )
            })}
          </fieldset>

          <SheetFooter className="absolute bottom-0 left-0 right-0 flex-row gap-2 border-t bg-background p-6">
            <Button variant="ghost" className="flex-1" onClick={() => setIsRolesSheetOpen(false)}>Cancelar</Button>
            <Button
              className="flex-1"
              disabled={!pendingRole || pendingRole === effectiveRole(assignedRoleCodes(activeUser)) && redundantRoles(assignedRoleCodes(activeUser)).length === 0}
              onClick={() => setIsRoleConfirmOpen(true)}
            >
              Revisar cambio
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <AlertDialog open={isRoleConfirmOpen} onOpenChange={(open) => { if (!isChangingRole) setIsRoleConfirmOpen(open) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar cambio de rol</AlertDialogTitle>
            <AlertDialogDescription>
              El rol de <strong>{activeUser?.name}</strong> pasará de{" "}
              <strong>{effectiveRoleLabel(assignedRoleCodes(activeUser))}</strong> a{" "}
              <strong>{pendingRole ? ROLE_INFO[pendingRole].name : ""}</strong>.{" "}
              {pendingRole && effectiveRole(assignedRoleCodes(activeUser)) && ROLE_HIERARCHY.indexOf(pendingRole) < ROLE_HIERARCHY.indexOf(effectiveRole(assignedRoleCodes(activeUser))!)
                ? "La persona perderá permisos de inmediato. "
                : "La persona obtendrá permisos adicionales. "}
              El cambio quedará registrado en la auditoría con su nombre y la fecha.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isChangingRole}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={(event) => { event.preventDefault(); void handleConfirmRoleChange() }} disabled={isChangingRole}>
              {isChangingRole && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmar cambio
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* GENERATED PASSWORD DIALOG */}
      <Dialog open={!!generatedPassword} onOpenChange={(open) => {
        if (!open) setGeneratedPassword(null)
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Contraseña temporal generada</DialogTitle>
            <DialogDescription>
              Guarde esta contraseña temporal en un lugar seguro.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="bg-muted p-4 rounded-md text-center">
              <span className="text-sm text-muted-foreground block mb-2">{generatedPassword?.email}</span>
              <span className="text-2xl font-mono tracking-widest font-bold">{generatedPassword?.password}</span>
            </div>
          </div>
          <DialogFooter className="sm:justify-between flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => {
                if (generatedPassword) {
                  const content = `Correo: ${generatedPassword.email}\nContraseña: ${generatedPassword.password}`
                  const blob = new Blob([content], { type: "text/plain" })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement("a")
                  a.href = url
                  a.download = `credenciales-${generatedPassword.email}.txt`
                  a.click()
                  URL.revokeObjectURL(url)
                }
              }}
              className="flex-1"
            >
              <Download className="mr-2 h-4 w-4" />
              Descargar .txt
            </Button>
            <Button
              onClick={() => {
                if (generatedPassword) {
                  navigator.clipboard.writeText(generatedPassword.password)
                  showToast.success("Copiada", "Contraseña copiada al portapapeles")
                }
              }}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              <Copy className="mr-2 h-4 w-4" />
              Copiar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
