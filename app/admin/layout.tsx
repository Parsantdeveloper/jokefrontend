'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/axiosInstance'

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter()
  const [status, setStatus] = useState<'checking' | 'ok'>('checking')

  useEffect(() => {
    let ignore = false

    api.get<{ data?: { role?: string }; role?: string }>('/auth/session')
      .then(({ data }) => {
        if (ignore) return
        const role = data.data?.role ?? data.role
        if (role !== 'ADMIN') router.replace('/unauthorized')
        else setStatus('ok')
      })
      .catch(() => {
        if (!ignore) router.replace('/auth/login')
      })

    return () => { ignore = true }
  }, [router])

  if (status === 'checking') return null
  return <>{children}</>
}
