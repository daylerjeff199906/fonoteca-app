import { redirect } from 'next/navigation'
import { createBioIntranetServer } from '@/utils/supabase/bio-intranet/server'
import { cookies, headers } from 'next/headers'

export default async function LoginPage() {
  const cookieStore = await cookies()
  const supabase = await createBioIntranetServer(cookieStore)
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
  
  redirect(`${authBaseUrl}/es/login?redirect=${encodeURIComponent(fullRedirectUrl)}`)

  return null
}
