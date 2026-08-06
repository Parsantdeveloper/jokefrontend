import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/lib/redis";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface CachedRedirect {
  to: string;
  status: 307 | 308;
}

interface ApiEnvelope<T> {
  status: number;
  message: string;
  data: T;
}

type RedirectLookupResult =
  | { redirect: true; to: string; status: 307 | 308 }
  | { redirect: false };

async function lookupFromApi(pathname: string): Promise<RedirectLookupResult> {
  try {
    const res = await fetch(
      `${API_URL}/redirect/lookup?path=${encodeURIComponent(pathname)}`,
    );
    if (!res.ok) return { redirect: false };
    const json = (await res.json()) as ApiEnvelope<RedirectLookupResult>;
    return json.data;
  } catch {
    return { redirect: false };
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  try {
    const cached = await redis.get<CachedRedirect>(`redirect:${pathname}`);
    if (cached) {
      return NextResponse.redirect(new URL(cached.to, request.url), cached.status);
    }
  } catch (error) {
    // Redis being down shouldn't take the site down — fall through to
    // the API, which is slower but authoritative.
    console.error(`Redis lookup failed for "${pathname}":`, error);
  }

  // Cache miss (genuinely no redirect, or not synced) — ask the backend.
  const lookup = await lookupFromApi(pathname);
  if (lookup.redirect) {
    return NextResponse.redirect(new URL(lookup.to, request.url), lookup.status);
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/jokes/:slug((?!$).*)",
};