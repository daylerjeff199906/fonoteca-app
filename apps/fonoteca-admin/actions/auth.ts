'use server'

import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createBioIntranetServer } from '@/utils/supabase/bio-intranet/server'

export async function signout() {
    const cookieStore = await cookies()
    const headerList = await headers()
    const host = headerList.get('host') || ''
    const supabase = await createBioIntranetServer(cookieStore, host)

    await supabase.auth.signOut()

    const isDev = host.includes('localhost') || host.includes('127.0.0.1')

    // Consultar configuración de módulos para redirección dinámica
    const [{ data: moduleData }, { data: authModule }] = await Promise.all([
        supabase.from('modules').select('url_prod, url_local, path').eq('code', 'fonoteca').maybeSingle(),
        supabase.from('modules').select('url_prod, url_local').eq('code', 'auth').maybeSingle()
    ])

    const baseUrl = isDev 
        ? (moduleData?.url_local || 'http://localhost:3006') 
        : (moduleData?.url_prod || 'https://fonoteca.iiap.gob.pe')

    const authBaseUrl = isDev
        ? (authModule?.url_local || 'http://localhost:3003')
        : (authModule?.url_prod || 'https://auth.iiap.gob.pe')

    const modulePath = moduleData?.path || '/dashboard'
    const fullRedirectUrl = `${baseUrl}${modulePath}`
    const loginUrl = `${authBaseUrl}/es/login?redirect=${encodeURIComponent(fullRedirectUrl)}`

    revalidatePath('/', 'layout')
    redirect(loginUrl)
}
