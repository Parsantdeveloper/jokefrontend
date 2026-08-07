import { Joke } from "../types/types";
import { api } from "./axiosInstance"; 

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// ─── Public (read‑only) – use fetch for ISR ────────────────────────────────

export async function getAllJokes(): Promise<Joke[]> {
  const res = await fetch(`${API_URL}/joke`, {
    headers: { 'Content-Type': 'application/json' },
    next: { revalidate: 86400 },
  });
  if (!res.ok) throw new Error(`Failed to fetch jokes: ${res.status}`);
  const json = await res.json();
  return json.data as Joke[];
}

export async function getJokeBySlug(slug: string): Promise<Joke | null> {
  const res = await fetch(`${API_URL}/joke/${encodeURIComponent(slug)}`, {
    headers: { 'Content-Type': 'application/json' },
    next: { revalidate: 86400 },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to fetch joke "${slug}": ${res.status}`);
  const json = await res.json();
  return json.data as Joke;
}

export async function getRedirectForPath(path: string) {
  const res = await fetch(
    `${API_URL}/redirect/lookup?path=${encodeURIComponent(path)}`,
    { headers: { 'Content-Type': 'application/json' }, next: { revalidate: 86400 } }
  );
  if (!res.ok) return { redirect: false };
  return (await res.json()) as { redirect: boolean; to?: string; status?: 307 | 308 };
}

// ─── Admin mutations – use axios (with auth & refresh) ─────────────────────

export async function createJoke(data: { title: string; content: string }): Promise<Joke> {
  const response = await api.post('/joke', data);
  return response.data.data.joke as Joke;
}

export async function updateJoke(slug: string, data: { title?: string; content?: string }): Promise<Joke | null> {
  try {
    const response = await api.put(`/joke/${encodeURIComponent(slug)}`, data);
    return response.data.data.joke as Joke;
  } catch (error: any) {
    if (error.response?.status === 404) return null;
    throw error;
  }
}

export async function deleteJoke(slug: string): Promise<void> {
  await api.delete(`/joke/${encodeURIComponent(slug)}`);
}