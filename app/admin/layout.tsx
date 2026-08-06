import { api } from '@/lib/axiosInstance'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Toaster } from "@/components/ui/toast"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('accessToken')?.value

  if (!accessToken) {
    redirect('/auth/login')
  }

  try {
    const { data } = await api.get('/auth/session', {
      headers: {
        Cookie: `accessToken=${accessToken}`,
      },
    })

    const role = data?.data?.role ?? data?.role
    if (role !== 'ADMIN') {
      redirect('/unauthorized')
    }
  } catch (error) {
    // Any failure (network, 401, etc.) sends the user to login
    redirect('/auth/login')
  }

  return <>
    <Toaster />
  
  {children}</>
}