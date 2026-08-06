import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface ApiEnvelope<T> {
  status: number;
  message: string;
  data: T;
}

type RedirectLookupResult =
  | { redirect: true; to: string; status: 307 | 308 }
  | { redirect: false };

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  let lookup: RedirectLookupResult;

  try {
    const res = await fetch(
      `${API_URL}/redirect/lookup?path=${encodeURIComponent(pathname)}`,
      {
        next: { revalidate: 60 },
      }
    );

    if (!res.ok) {
     // If the API call fails, we don't want to block the request; just continue as normal.
      return NextResponse.next();
    }

    const json = (await res.json()) as ApiEnvelope<RedirectLookupResult>;
    lookup = json.data;
  } catch {
    return NextResponse.next();
  }

  if (lookup.redirect) {
    return NextResponse.redirect(new URL(lookup.to, request.url), lookup.status);
  }

  return NextResponse.next();
}

export const config = {
  // Only run this check on joke detail pages — not /jokes (the list),
  // not /admin, not static assets.
  matcher: "/jokes/:slug((?!$).*)",
};