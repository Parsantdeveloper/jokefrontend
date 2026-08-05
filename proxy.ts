import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL!;

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const accessToken = request.cookies.get("accessToken")?.value;

  if (!accessToken) {
    return redirectToLogin(request);
  }

  // get session from backend to validate the access token and check the role
  const res = await fetch(`${BACKEND_URL}/auth/session`, {
    headers: { cookie: `accessToken=${accessToken}` },
    cache: "no-store",
    credentials: 'include' 
  });

  if (!res.ok) {
    return redirectToLogin(request);
  }

  const { data: session } = await res.json();

  if (pathname.startsWith("/admin") && session?.role !== "ADMIN") {
    // authenticated, but not authorized
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  return NextResponse.next();
}

function redirectToLogin(request: NextRequest) {
  const loginUrl = new URL("/auth/login", request.url);
  loginUrl.searchParams.set("from", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*"],
};