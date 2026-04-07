import { auth } from "@/auth";
import { NextResponse } from "next/server";

function addCorsHeaders(res: NextResponse, origin: string) {
  res.headers.set("Access-Control-Allow-Origin", origin);
  res.headers.set("Access-Control-Allow-Credentials", "true");
  res.headers.set("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return res;
}

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const origin = req.headers.get("origin") ?? "";
  const isExtension = origin.startsWith("chrome-extension://");

  // Handle CORS preflight from extension before any auth logic
  if (req.method === "OPTIONS" && isExtension) {
    return addCorsHeaders(new NextResponse(null, { status: 200 }), origin);
  }

  const isPublic =
    req.nextUrl.pathname.startsWith("/api/auth") ||
    req.nextUrl.pathname === "/signin" ||
    req.nextUrl.pathname === "/signup";

  if (isPublic) {
    const res = NextResponse.next();
    if (isExtension) addCorsHeaders(res, origin);
    return res;
  }

  if (!isLoggedIn) {
    // Return 401 for extension API calls instead of redirecting to /signin
    if (isExtension) {
      return addCorsHeaders(
        NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
        origin
      );
    }
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  const res = NextResponse.next();
  if (isExtension) addCorsHeaders(res, origin);
  return res;
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
