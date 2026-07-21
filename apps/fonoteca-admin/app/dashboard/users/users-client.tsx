"use client"

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
  Pencil,
  Plus,
  Loader2,
  Trash2,
  ShieldHalf,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { SearchInput } from "@/components/dashboard/search-input"
import { PaginationButtons } from "@/components/dashboard/pagination-buttons"
import {
  createSystemUser,
  updateSystemUser,
  deleteSystemUser,
  assignSystemRoles,
  revokeSystemRoles,
  resetSystemPassword
} from "@/actions/system-users"
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
  role: string
  created_at: string
  user_roles?: UserRole[]
}

interface SystemUsersClientProps {
  initialUsers: SystemUser[]
  totalCount: number
}

// Available standard roles to assign
const AVAILABLE_ROLES = [
  { code: "ADMIN", name: "Administrador" },
  { code: "EDITOR", name: "Editor" },
  { code: "USER", name: "Usuario" }
]

export function SystemUsersClient({
  initialUsers,
  totalCount,
}: SystemUsersClientProps) {
  const router = useRouter()
  const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null)
  
  // Dialogs state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isRolesSheetOpen, setIsRolesSheetOpen] = useState(false)
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false)
  const [isResetAlertOpen, setIsResetAlertOpen] = useState(false)

  // Loaders
  const [isSaving, setIsSaving] = useState(false)
  const [loadingRoles, setLoadingRoles] = useState<Record<string, boolean>>({})

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "USER"
  })

  const openCreate = () => {
    setFormData({ name: "", email: "", role: "USER" })
    setIsCreateDialogOpen(true)
  }

  const openEdit = (user: SystemUser) => {
    setSelectedUser(user)
    setFormData({ name: user.name, email: user.email, role: user.role })
    setIsEditDialogOpen(true)
  }

  const openRoles = (user: SystemUser) => {
    setSelectedUser(user)
    setIsRolesSheetOpen(true)
  }

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault()
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
        showToast.success("Contraseña reseteada", "Se ha enviado un correo con la nueva contraseña temporal al usuario.")
        setIsResetAlertOpen(false)
      } else {
        showToast.error("Error", res.error)
      }
    } catch (error) {
      showToast.error("Error", "Ocurrió un error inesperado.")
    }
  }

  const handleToggleRole = async (roleCode: string, isAssigned: boolean) => {
    if (!selectedUser) return
    setLoadingRoles(prev => ({ ...prev, [roleCode]: true }))

    try {
      if (isAssigned) {
        const res = await revokeSystemRoles(selectedUser.id, [roleCode])
        if (res.success) showToast.success("Rol revocado", "El rol ha sido removido exitosamente.")
        else showToast.error("Error", res.error)
      } else {
        const res = await assignSystemRoles(selectedUser.id, [roleCode])
        if (res.success) showToast.success("Rol asignado", "El rol ha sido agregado exitosamente.")
        else showToast.error("Error", res.error)
      }
      
      // Since we mutated roles, we might need a full reload if the API doesn't return the nested relations properly
      // We will let router.refresh() do its job.
      router.refresh()
      
      // Optimistic update logic could go here but router.refresh is enough for now.
    } catch (error) {
      showToast.error("Error", "Ocurrió un error inesperado al actualizar el rol.")
    } finally {
      setLoadingRoles(prev => ({ ...prev, [roleCode]: false }))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1 max-w-sm">
          <SearchInput placeholder="Buscar por nombre o correo..." />
        </div>

        <Button className="gap-2 h-9" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Crear Usuario
        </Button>
      </div>

      <div className="bg-card border rounded-md">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-bold">Usuario</TableHead>
              <TableHead className="font-bold">Rol Principal</TableHead>
              <TableHead className="font-bold">Roles Adicionales</TableHead>
              <TableHead className="text-right font-bold">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialUsers.length > 0 ? (
              initialUsers.map((user) => {
                const additionalRoles = user.user_roles?.map(ur => ur.roles?.code).filter(Boolean) || []

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
                      <Badge variant="outline" className="text-[10px] font-semibold border-primary/20 text-primary">
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1.5">
                        {additionalRoles.length > 0 ? (
                          additionalRoles.map((role, idx) => (
                            <Badge
                              key={idx}
                              variant="secondary"
                              className="text-[10px] py-0 px-1.5 font-semibold bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800"
                            >
                              {role}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground italic">Ninguno</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openRoles(user)}
                          title="Gestionar Roles"
                        >
                          <ShieldHalf className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => {
                            setSelectedUser(user)
                            setIsResetAlertOpen(true)
                          }}
                          title="Resetear Contraseña"
                        >
                          <KeyRound className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEdit(user)}
                          title="Editar Usuario"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => {
                            setSelectedUser(user)
                            setIsDeleteAlertOpen(true)
                          }}
                          title="Eliminar Usuario"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  No se encontraron usuarios.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Mostrando <span className="font-medium">{initialUsers.length}</span> de <span className="font-medium">{totalCount}</span> usuarios
        </p>
        <PaginationButtons totalCount={totalCount} pageSize={10} />
      </div>

      {/* CREATE / EDIT DIALOG */}
      <Dialog open={isCreateDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateDialogOpen(false)
          setIsEditDialogOpen(false)
        }
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{isEditDialogOpen ? "Editar Usuario" : "Crear Nuevo Usuario"}</DialogTitle>
            <DialogDescription>
              {isEditDialogOpen 
                ? "Modifica los datos básicos del usuario." 
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
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Rol Principal</Label>
              <select
                id="role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="USER">Usuario</option>
                <option value="EDITOR">Editor</option>
                <option value="ADMIN">Administrador</option>
              </select>
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="ghost" onClick={() => {
                setIsCreateDialogOpen(false)
                setIsEditDialogOpen(false)
              }}>Cancelar</Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditDialogOpen ? "Guardar Cambios" : "Crear Usuario"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DELETE ALERT */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">Eliminar Usuario</AlertDialogTitle>
            <AlertDialogDescription>
              Estás a punto de eliminar permanentemente al usuario <strong>{selectedUser?.name}</strong>. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Sí, Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* RESET PASSWORD ALERT */}
      <AlertDialog open={isResetAlertOpen} onOpenChange={setIsResetAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Resetear Contraseña</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Seguro que deseas resetear la contraseña de <strong>{selectedUser?.name}</strong>?
              Se generará una nueva contraseña temporal y será enviada a <strong>{selectedUser?.email}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetPassword}>
              Sí, Resetear
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ROLES SHEET */}
      <Sheet open={isRolesSheetOpen} onOpenChange={setIsRolesSheetOpen}>
        <SheetContent className="sm:max-w-md py-0 px-4">
          <SheetHeader className="space-y-1 mt-6">
            <SheetTitle>Roles Adicionales</SheetTitle>
            <SheetDescription>
              Gestiona los roles adicionales de <strong>{selectedUser?.name}</strong>.
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            <div className="space-y-4">
              <div className="grid gap-4">
                {AVAILABLE_ROLES.map((role) => {
                  // user_roles has { roles: { code, ... } }
                  const userRoles = selectedUser?.user_roles || []
                  const isAssigned = userRoles.some(ur => ur.roles?.code === role.code)
                  const isLoading = loadingRoles[role.code] || false
                  
                  return (
                    <label
                      key={role.code}
                      htmlFor={`role-${role.code}`}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-none border transition-all cursor-pointer group",
                        isAssigned
                          ? "bg-emerald-50/50 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/30"
                          : "bg-background border-border hover:border-emerald-200 hover:bg-emerald-50/20"
                      )}
                    >
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm group-hover:text-emerald-700 transition-colors">
                            {role.name}
                          </span>
                          {isAssigned && (
                            <Badge className="h-4 text-[8px] bg-emerald-500 hover:bg-emerald-600 border-none px-1 uppercase font-bold tracking-tighter">
                              Asignado
                            </Badge>
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground max-w-[200px]">
                          Código: {role.code}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                        <Checkbox
                          id={`role-${role.code}`}
                          checked={isAssigned}
                          disabled={isLoading}
                          onCheckedChange={() => handleToggleRole(role.code, isAssigned)}
                          className={cn(
                            "h-5 w-5 border-2 transition-transform group-hover:scale-110",
                            isAssigned && "bg-emerald-500 border-emerald-500 data-[state=checked]:bg-emerald-500 data-[state=checked]:text-white"
                          )}
                        />
                      </div>
                    </label>
                  )
                })}
              </div>
            </div>
          </div>

          <SheetFooter className="absolute bottom-0 left-0 right-0 p-6 border-t bg-background">
            <Button className="w-full h-10 shadow-sm" onClick={() => setIsRolesSheetOpen(false)}>
              Cerrar Gestión
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
