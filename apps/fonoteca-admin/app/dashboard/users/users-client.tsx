
"use client"

import { useState, useEffect } from "react"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter
} from "@/components/ui/sheet"
import {
  Search,
  UserCog,
  X,
  Plus,
  Loader2,
  Trash2,
} from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { SearchInput } from "@/components/dashboard/search-input"
import { PaginationButtons } from "@/components/dashboard/pagination-buttons"
import { assignUserRole, removeUserRole, createUser, getAvailableUsersForModule, removeUserFromModule } from "@/actions/users"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger
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
import { Skeleton } from "@/components/ui/skeleton"
import { Label } from "@/components/ui/label"
import { showToast } from "@/lib/toast"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

interface Profile {
  id: string
  first_name: string | null
  last_name: string | null
  email: string | null
  avatar_url: string | null
}

interface Role {
  id: string
  name: string
  description: string | null
}

interface UserRole {
  profile_id: string
  role_id: string
  roles: {
    name: string
  } | null
}

interface UsersClientProps {
  initialProfiles: Profile[]
  initialRoles: Role[]
  initialUserRoles: UserRole[]
  moduleId: string
  totalCount: number
  initialPermissions: { id: string, action: string }[]
}

export function UsersClient({
  initialProfiles,
  initialRoles,
  initialUserRoles,
  moduleId,
  totalCount,
  initialPermissions
}: UsersClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isCreatingUser, setIsCreatingUser] = useState(false)
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const [availableUsers, setAvailableUsers] = useState<Profile[]>([])
  const [isFetchingAvailable, setIsFetchingAvailable] = useState(false)
  const [assignSearch, setAssignSearch] = useState("")
  const [isRemoveAlertOpen, setIsRemoveAlertOpen] = useState(false)
  const [userToRemove, setUserToRemove] = useState<Profile | null>(null)
  const [loadingRoles, setLoadingRoles] = useState<Record<string, boolean>>({})

  const [newUser, setNewUser] = useState({
    first_name: "",
    last_name: "",
    email: ""
  })

  // Get roles for a specific profile in this module
  const getUserRoles = (profileId: string) => {
    return initialUserRoles
      .filter(ur => ur.profile_id === profileId)
      .map(ur => ({
        id: ur.role_id,
        name: ur.roles?.name || "Desconocido"
      }))
  }

  const handleEditRoles = (profile: Profile) => {
    setSelectedUser(profile)
    setIsSheetOpen(true)
  }

  const handleToggleRole = async (profileId: string, roleId: string, isAssigned: boolean) => {
    const key = `${profileId}-${roleId}`
    setLoadingRoles(prev => ({ ...prev, [key]: true }))

    try {
      if (isAssigned) {
        const res = await removeUserRole(profileId, roleId, moduleId)
        if (res.success) {
          showToast.success("Rol eliminado", "El rol ha sido revocado exitosamente.")
        } else {
          showToast.error("Error", res.error || "No se pudo eliminar el rol.")
        }
      } else {
        const res = await assignUserRole(profileId, roleId, moduleId)
        if (res.success) {
          showToast.success("Rol asignado", "El rol ha sido concedido exitosamente.")
        } else {
          showToast.error("Error", res.error || "No se pudo asignar el rol.")
        }
      }
      router.refresh()
    } catch (error) {
      showToast.error("Error", "Ocurrió un error inesperado al actualizar el rol.")
    } finally {
      setLoadingRoles(prev => ({ ...prev, [key]: false }))
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreatingUser(true)

    try {
      const res = await createUser(newUser)
      if (res.success) {
        showToast.success("Usuario creado", "El perfil ha sido creado exitosamente.")
        setIsCreateDialogOpen(false)
        setNewUser({ first_name: "", last_name: "", email: "" })
        router.refresh()
      } else {
        showToast.error("Error", res.error || "No se pudo crear el usuario.")
      }
    } catch (error) {
      showToast.error("Error", "Ocurrió un error inesperado al crear el usuario.")
    } finally {
      setIsCreatingUser(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isAssignDialogOpen) {
        fetchAvailableUsers(assignSearch)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [assignSearch, isAssignDialogOpen])

  const fetchAvailableUsers = async (query: string = "") => {
    setIsFetchingAvailable(true)
    try {
      const res = await getAvailableUsersForModule(moduleId, query)
      if (res.success) {
        setAvailableUsers(res.data)
      }
    } catch (error) {
      console.error("Error fetching available users:", error)
    } finally {
      setIsFetchingAvailable(false)
    }
  }

  const handleOpenAssign = () => {
    setIsAssignDialogOpen(true)
    setAssignSearch("")
  }

  const handleRemoveFromModule = async (profileId: string) => {
    try {
      const res = await removeUserFromModule(profileId, moduleId)
      if (res.success) {
        showToast.success("Usuario eliminado", "El acceso al módulo ha sido revocado.")
        setIsRemoveAlertOpen(false)
        setUserToRemove(null)
        router.refresh()
      } else {
        showToast.error("Error", res.error || "No se pudo eliminar el usuario del módulo.")
      }
    } catch (error) {
      showToast.error("Error", "Ocurrió un error inesperado.")
    }
  }

  const confirmRemove = (profile: Profile) => {
    setUserToRemove(profile)
    setIsRemoveAlertOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1 max-w-sm">
          <SearchInput placeholder="Buscar por nombre o correo..." />
        </div>

        <div className="flex items-center gap-2">
          <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2 h-9" onClick={handleOpenAssign}>
                <UserCog className="h-4 w-4" />
                Asignar Existente
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Asignar Usuario a Fonoteca</DialogTitle>
                <DialogDescription>
                  Busca un usuario existente en la base de datos general para darle acceso a este módulo.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nombre o email..."
                    className="pl-9"
                    value={assignSearch}
                    onChange={(e) => setAssignSearch(e.target.value)}
                  />
                </div>

                <div className="min-h-[350px] max-h-[400px] overflow-y-auto space-y-2 pr-2">
                  {isFetchingAvailable ? (
                    <div className="space-y-3 py-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                          <div className="flex items-center gap-3">
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <div className="space-y-2">
                              <Skeleton className="h-4 w-32" />
                              <Skeleton className="h-3 w-24" />
                            </div>
                          </div>
                          <Skeleton className="h-8 w-16" />
                        </div>
                      ))}
                    </div>
                  ) : availableUsers.length > 0 ? (
                    availableUsers.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar className="h-8 w-8 border">
                            <AvatarImage src={user.avatar_url || ""} />
                            <AvatarFallback className="text-[10px]">
                              {user.first_name?.[0]}{user.last_name?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-sm truncate">{user.first_name} {user.last_name}</span>
                            <span className="text-[10px] text-muted-foreground truncate">{user.email}</span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          className="h-8 text-xs px-4"
                          onClick={() => {
                            setIsAssignDialogOpen(false)
                            handleEditRoles(user)
                          }}
                        >
                          Elegir
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p className="text-sm italic">No se encontraron usuarios disponibles.</p>
                    </div>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 h-9">
                <Plus className="h-4 w-4" />
                Crear Usuario
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Crear Nuevo Perfil</DialogTitle>
                <DialogDescription>
                  Ingresa los datos básicos para el nuevo perfil de usuario en la plataforma.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateUser} className="space-y-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="first_name" className="text-right">Nombre</Label>
                  <Input
                    id="first_name"
                    value={newUser.first_name}
                    onChange={(e) => setNewUser({ ...newUser, first_name: e.target.value })}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="last_name" className="text-right">Apellido</Label>
                  <Input
                    id="last_name"
                    value={newUser.last_name}
                    onChange={(e) => setNewUser({ ...newUser, last_name: e.target.value })}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="col-span-3"
                    required
                  />
                </div>
                <DialogFooter className="pt-4">
                  <Button type="button" variant="ghost" onClick={() => setIsCreateDialogOpen(false)}>Cancelar</Button>
                  <Button type="submit" disabled={isCreatingUser}>
                    {isCreatingUser && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Crear Perfil
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="bg-card border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-bold">Usuario</TableHead>
              <TableHead className="font-bold">Roles en Fonoteca</TableHead>
              <TableHead className="text-right font-bold">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialProfiles.length > 0 ? (
              initialProfiles.map((profile) => {
                const userRoles = getUserRoles(profile.id)
                const hasAccess = userRoles.length > 0

                return (
                  <TableRow key={profile.id} className={cn(!hasAccess && "opacity-60")}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 border">
                          <AvatarImage src={profile.avatar_url || ""} />
                          <AvatarFallback className="bg-primary/5 text-primary text-[10px]">
                            {profile.first_name?.[0]}{profile.last_name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0">
                          <span className="font-semibold text-sm whitespace-nowrap">
                            {profile.first_name} {profile.last_name}
                          </span>
                          <span className="text-[10px] text-muted-foreground truncate">
                            {profile.email}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1.5">
                        {userRoles.length > 0 ? (
                          userRoles.map((role) => (
                            <Badge
                              key={role.id}
                              variant="secondary"
                              className="text-[10px] py-0 px-1.5 font-semibold bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800"
                            >
                              {role.name}
                            </Badge>
                          ))
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-[10px] text-muted-foreground border-dashed bg-muted/20"
                          >
                            Sin acceso al módulo
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant={hasAccess ? "ghost" : "default"}
                          size="sm"
                          className={cn(
                            "h-8 gap-1.5 text-xs",
                            !hasAccess && "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                          )}
                          onClick={() => handleEditRoles(profile)}
                        >
                          {hasAccess ? (
                            <>
                              <UserCog className="h-3.5 w-3.5" />
                              Gestionar
                            </>
                          ) : (
                            <>
                              <Plus className="h-3.5 w-3.5" />
                              Dar Acceso
                            </>
                          )}
                        </Button>
                        {hasAccess && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => confirmRemove(profile)}
                            title="Eliminar del módulo"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                  No se encontraron usuarios.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Mostrando <span className="font-medium">{initialProfiles.length}</span> de <span className="font-medium">{totalCount}</span> usuarios
        </p>
        <PaginationButtons totalCount={totalCount} pageSize={10} />
      </div>

      <AlertDialog open={isRemoveAlertOpen} onOpenChange={setIsRemoveAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              ¿Quitar acceso al módulo?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Estás a punto de revocar todos los permisos de <strong>{userToRemove?.first_name} {userToRemove?.last_name}</strong> en el módulo de Fonoteca.
              Esta acción no eliminará el perfil del usuario de la plataforma general.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => userToRemove && handleRemoveFromModule(userToRemove.id)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Quitar Acceso
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-md py-0 px-4">
          <SheetHeader className="space-y-1">
            <SheetTitle className="flex items-center gap-2">
              Roles de Usuario
            </SheetTitle>
            <SheetDescription>
              Gestiona los roles de <strong>{selectedUser?.first_name} {selectedUser?.last_name}</strong> en el módulo de Fonoteca.
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Permisos del Módulo</h4>
              <div className="flex flex-wrap gap-2">
                {initialPermissions.length > 0 ? (
                  initialPermissions.map((perm) => (
                    <Badge key={perm.id} variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200">
                      {perm.action}
                    </Badge>
                  ))
                ) : (
                  <span className="text-[10px] text-muted-foreground italic">No hay acciones definidas para este módulo.</span>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Asignación de Roles</h4>
              <div className="grid gap-4">
                {initialRoles.map((role) => {
                  const userRoles = selectedUser ? getUserRoles(selectedUser.id) : []
                  const isAssigned = userRoles.some(ur => ur.id === role.id)
                  const isLoading = selectedUser ? loadingRoles[`${selectedUser.id}-${role.id}`] : false
                  return (
                    <label
                      key={role.id}
                      htmlFor={`role-${role.id}`}
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
                          {role.description || "Sin descripción disponible para este rol."}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                        <Checkbox
                          id={`role-${role.id}`}
                          checked={isAssigned}
                          disabled={isLoading}
                          onCheckedChange={() => selectedUser && handleToggleRole(selectedUser.id, role.id, isAssigned)}
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

            <div className="rounded-lg bg-muted/40 p-3 border border-muted-foreground/10">
              <div className="flex items-start gap-2.5">
                <div className="space-y-1">
                  <p className="text-[11px] font-semibold">Nota sobre permisos</p>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    Al asignar un rol, el usuario recibirá automáticamente los permisos asociados a ese rol para las acciones dentro de este módulo. Los roles globales como "Admin" otorgan acceso total.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <SheetFooter className="absolute bottom-0 left-0 right-0 p-6 border-t bg-background">
            <Button className="w-full h-10 shadow-sm" onClick={() => setIsSheetOpen(false)}>
              Cerrar Gestión
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
