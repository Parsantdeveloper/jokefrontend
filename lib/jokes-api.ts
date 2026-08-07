import { Joke, RedirectLookupResult } from "../types/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const fetchOptions = (init?: RequestInit): RequestInit => ({
  ...init,
  credentials: 'include', 
  headers: {
    'Content-Type': 'application/json',
    ...init?.headers,
  },
});

export async function getAllJokes(): Promise<Joke[]> {
  const res = await fetch(`${API_URL}/joke`, {
    ...fetchOptions(),
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

export async function getRedirectForPath(path: string): Promise<RedirectLookupResult> {
  const res = await fetch(
    `${API_URL}/redirect/lookup?path=${encodeURIComponent(path)}`,
    { ...fetchOptions(), next: { revalidate: 86400 } }
  );

  if (!res.ok) return { redirect: false };
  return (await res.json()) as RedirectLookupResult;
}

export async function createJoke(data: { title: string; content: string }): Promise<Joke> {
  const res = await fetch(`${API_URL}/joke`, {
    ...fetchOptions({
      method: 'POST',
      body: JSON.stringify(data),
    }),
  });

  if (!res.ok) throw new Error(`Failed to create joke: ${res.status}`);
  const json = await res.json();
  return json.data.joke as Joke;
}

export async function updateJoke(slug: string, data: { title?: string; content?: string }): Promise<Joke | null> {
  const res = await fetch(`${API_URL}/joke/${encodeURIComponent(slug)}`, {
    ...fetchOptions({
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  });

  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Failed to update joke "${slug}": ${res.status}`);
  const json = await res.json();
  return json.data.joke as Joke;
}

export async function deleteJoke(slug: string): Promise<void> {
  const res = await fetch(`${API_URL}/joke/${encodeURIComponent(slug)}`, {
    ...fetchOptions({ method: 'DELETE' }),
  });

  if (!res.ok) throw new Error(`Failed to delete joke "${slug}": ${res.status}`);
}