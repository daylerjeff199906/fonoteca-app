import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { SiteHeader } from "@/components/panel-admin/site-header"
import { AdminSidebar } from "@/components/panel-admin/admin-sidebar"
import { createBioIntranetServer } from '@/utils/supabase/bio-intranet/server'
import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { AppSidebar } from "@/components/app-sidebar"
import { getAuthorizedTeams } from "@/actions/auth-teams"

import { TeamsProvider } from "@/components/providers/teams-provider"
import { PageHeaderProvider } from "@/components/providers/page-header-provider"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = "es";
  const cookieStore = await cookies()
  const supabase = await createBioIntranetServer(cookieStore)


  const { data: { user } } = await supabase.auth.getUser()

  const host = (await headers()).get('host')
  const isDev = host?.includes('localhost') || host?.includes('127.0.0.1')

  // Consultar configuración de módulos para redirección dinámica desde la tabla public.modules
  const [{ data: moduleData }, { data: authModule }] = await Promise.all([
    supabase.from('modules').select('url_prod, url_local, path').eq('code', 'fonoteca').maybeSingle(),
    supabase.from('modules').select('url_prod, url_local').eq('code', 'auth').maybeSingle()
  ])

  // Determinar la URL base según el entorno
  const baseUrl = isDev 
    ? (moduleData?.url_local || 'http://localhost:3006') 
    : (moduleData?.url_prod || 'https://fonoteca.iiap.gob.pe')
  
  const authBaseUrl = isDev
    ? (authModule?.url_local || 'http://localhost:3003')
    : (authModule?.url_prod || 'https://auth.iiap.gob.pe')

  const modulePath = moduleData?.path || '/dashboard'
  const fullRedirectUrl = `${baseUrl}${modulePath}`
  const loginUrl = `${authBaseUrl}/es/login?redirect=${encodeURIComponent(fullRedirectUrl)}`

  if (!user) {
    redirect(loginUrl)
  }

  // Obtener roles o datos del perfil
  let role = 'user'
  let name = 'Usuario'

  // Intentar obtener un nombre desde el perfil buscando por auth_id
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, first_name, last_name')
    .eq('auth_id', user.id)
    .single()

  if (!profile) {
    // Si no hay perfil, algo anda mal, mejor cerrar sesión o redirigir
    redirect(loginUrl)
  }

  name = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Usuario'

  // Verificación de acceso al módulo Fonoteca
  // Obtenemos los módulos asignados al usuario en user_roles
  const { data: userRolesData } = await supabase
    .from('user_roles')
    .select(`
      role_id, 
      module_id,
      roles (name),
      modules (code)
    `)
    .eq('profile_id', profile.id)

  const roles = userRolesData?.map((ur: any) => ur.roles?.name).filter(Boolean) || []
  if (roles.length > 0) role = roles[0]

  const isAdmin = roles.some(r => r.toLowerCase() === 'admin')
  const hasModuleAccess = userRolesData?.some((ur: any) => ur.modules?.code === 'fonoteca')

  if (!isAdmin && !hasModuleAccess) {
    // No tiene permiso para este módulo específico
    redirect(`${authBaseUrl}/es/launcher?error=unauthorized`)
  }

  const userData = {
    name: name,
    email: user?.email || 'email@ejemplo.com',
    avatar: '', // O poner la imagen si la hay
    role: role.toUpperCase()
  }
  
  const authorizedTeams = await getAuthorizedTeams()

  return (
    <TeamsProvider teams={authorizedTeams}>
      <PageHeaderProvider>
        <SidebarProvider>
          <AppSidebar userData={userData} />
          <SidebarInset className="max-h-svh overflow-auto">
            <SiteHeader />
            <main className="flex-1 p-4 lg:p-6">
              <div className="container mx-auto space-y-6">
                {children}
              </div>
            </main>
            <footer className="p-4 md:p-6 text-[10px] text-muted-foreground text-center mt-auto opacity-50 uppercase tracking-widest font-bold">
              &copy; {new Date().getFullYear()} IIAP. Todos los derechos reservados.
            </footer>
          </SidebarInset>
        </SidebarProvider>
      </PageHeaderProvider>
    </TeamsProvider>
  )
}


