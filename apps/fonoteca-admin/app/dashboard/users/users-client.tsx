
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
import { Input } from "@/components/ui/input"
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
  Shield,
  ShieldCheck,
  X,
  Plus,
  Loader2
} from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { SearchInput } from "@/components/dashboard/search-input"
import { PaginationButtons } from "@/components/dashboard/pagination-buttons"
import { assignUserRole, removeUserRole } from "@/actions/users"
import { showToast } from "@/lib/toast"
import { cn } from "@/lib/utils"

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
  const [loadingRoles, setLoadingRoles] = useState<Record<string, boolean>>({})

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
        await removeUserRole(profileId, roleId, moduleId)
        showToast.success("Rol eliminado", "El rol ha sido revocado exitosamente.")
      } else {
        await assignUserRole(profileId, roleId, moduleId)
        showToast.success("Rol asignado", "El rol ha sido concedido exitosamente.")
      }
      router.refresh()
    } catch (error) {
      showToast.error("Error", "No se pudo actualizar el rol del usuario.")
    } finally {
      setLoadingRoles(prev => ({ ...prev, [key]: false }))
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="flex-1 max-w-sm">
          <SearchInput placeholder="Buscar por nombre o correo..." />
        </div>
      </div>

      <div className="bg-card">
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
                          <span className="text-[10px] text-muted-foreground italic">
                            Sin acceso asignado
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1.5 text-xs"
                        onClick={() => handleEditRoles(profile)}
                      >
                        <UserCog className="h-3.5 w-3.5" />
                        Gestionar
                      </Button>
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
                    <div
                      key={role.id}
                      className={cn(
                        "flex items-center justify-between p-3 rounded-lg border transition-all",
                        isAssigned
                          ? "bg-emerald-50/50 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/30"
                          : "bg-background border-border hover:border-muted-foreground/20"
                      )}
                    >
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">{role.name}</span>
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

                      <Button
                        size="sm"
                        variant={isAssigned ? "destructive" : "outline"}
                        className={cn(
                          "h-8 text-[10px] font-bold uppercase tracking-wider gap-1.5",
                          !isAssigned && "hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200"
                        )}
                        disabled={isLoading}
                        onClick={() => selectedUser && handleToggleRole(selectedUser.id, role.id, isAssigned)}
                      >
                        {isLoading ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : isAssigned ? (
                          <>
                            <X className="h-3 w-3" />
                            Revocar
                          </>
                        ) : (
                          <>
                            <Plus className="h-3 w-3" />
                            Asignar
                          </>
                        )}
                      </Button>
                    </div>
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
