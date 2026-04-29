import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { createBioIntranetServer } from '@/utils/supabase/bio-intranet/server'

export default async function RootPage() {
  const cookieStore = await cookies()
  const host = (await headers()).get('host')
  const supabase = await createBioIntranetServer(cookieStore, host || undefined)
  
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  } else {
    redirect('/login')
  }

  return null
}
