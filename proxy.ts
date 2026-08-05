// proxy.ts
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL!; // e.g. https://api.yourapp.com

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const accessToken = request.cookies.get("accessToken")?.value;

  if (!accessToken) {
    return redirectToLogin(request);
  }

  // Validate the token + get role by calling your backend session endpoint.
  // Forwarding the cookie ensures this is the same check the API itself trusts.
  const res = await fetch(`${BACKEND_URL}/auth/session`, {
    headers: { cookie: `accessToken=${accessToken}` },
    cache: "no-store",
  });

  if (!res.ok) {
    return redirectToLogin(request);
  }

  const { data: session } = await res.json();

  if (pathname.startsWith("/admin") && session?.role !== "ADMIN") {
    // Authenticated, but not authorized
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  return NextResponse.next();
}

function redirectToLogin(request: NextRequest) {
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("from", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*"],
};