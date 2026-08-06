export type Redirect = {
  id: string
  from_path: string
  to_path: string
  type: string
  active: boolean
  createdAt: string
  updatedAt: string
}

export type RedirectsMeta = {
  page: number
  limit: number
  total: number
}

export type RedirectsResponse = {
  status: number
  message: string
  data: {
    redirects: Redirect[]
    meta: RedirectsMeta
  }
}

export type RedirectResponse = {
  status: number
  message: string
  data: Redirect
}

export type CreateRedirectInput = {
  from_path: string
  to_path: string
}

export type UpdateRedirectInput = {
  to_path: string
  active: boolean
  type: string
}

const apiUrl = () => (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/$/, '')

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiUrl()}${path}`, {
    ...init,
    credentials: 'include',               // ← sends the accessToken cookie
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }

  return response.json() as Promise<T>
}

export function getRedirects(params?: { page?: number; limit?: number }) {
  const search = new URLSearchParams()
  if (params?.page) search.set('page', String(params.page))
  if (params?.limit) search.set('limit', String(params.limit))
  const query = search.toString()
  return request<RedirectsResponse>(`/redirect${query ? `?${query}` : ''}`)
}

export function createRedirect(input: CreateRedirectInput) {
  return request<RedirectResponse>('/redirect', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function getRedirect(id: string) {
  return request<RedirectResponse>(`/redirect/${encodeURIComponent(id)}`)
}

export function updateRedirect(id: string, input: UpdateRedirectInput) {
  return request<RedirectResponse>(`/redirect/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  })
}