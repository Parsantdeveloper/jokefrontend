import { Joke, RedirectLookupResult } from "../types/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getAllJokes(): Promise<Joke[]> {
  const res = await fetch(`${API_URL}/joke`, {
    next: { revalidate: 86400 },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch jokes: ${res.status}`);
  }

  const json = await res.json();
  return json.data as Joke[];
}

export async function getJokeBySlug(slug: string): Promise<Joke | null> {
  const res = await fetch(`${API_URL}/joke/${encodeURIComponent(slug)}`, {
    next: { revalidate: 86400 },
  });

  if (res.status === 404) return null;

  if (!res.ok) {
    throw new Error(`Failed to fetch joke "${slug}": ${res.status}`);
  }

  const json = await res.json();
  return json.data as Joke;
}

export async function getRedirectForPath(
  path: string,
): Promise<RedirectLookupResult> {
  const res = await fetch(
    `${API_URL}/redirect/lookup?path=${encodeURIComponent(path)}`,
    { next: { revalidate: 86400 } },
  );

  if (!res.ok) {
    // fail closed: treat lookup failure as "no redirect" rather than throwing,
    // so a redirect-service hiccup doesn't 500 the whole page
    return { redirect: false };
  }

  return (await res.json()) as RedirectLookupResult;
}

/**
 * Create a new joke.
 * POST /joke
 */
export async function createJoke(data: {
  title: string;
  content: string;
}): Promise<Joke> {
  const res = await fetch(`${API_URL}/joke`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error(`Failed to create joke: ${res.status}`);
  }

  const json = await res.json();
  return json.data.joke as Joke; // Assuming response shape matches your example
}

/**
 * Update an existing joke by its slug.
 * PUT /joke/:slug
 */
export async function updateJoke(
  slug: string,
  data: {
    title?: string;
    content?: string;
  },
): Promise<Joke | null> {
  const res = await fetch(
    `${API_URL}/joke/${encodeURIComponent(slug)}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    },
  );

  if (res.status === 404) return null;

  if (!res.ok) {
    throw new Error(`Failed to update joke "${slug}": ${res.status}`);
  }

  const json = await res.json();
  return json.data.joke as Joke;
}

/**
 * Delete a joke by its slug.
 * DELETE /joke/:slug
 */
export async function deleteJoke(slug: string): Promise<void> {
  const res = await fetch(
    `${API_URL}/joke/${encodeURIComponent(slug)}`,
    {
      method: "DELETE",
    },
  );

  if (!res.ok) {
    throw new Error(`Failed to delete joke "${slug}": ${res.status}`);
  }
}