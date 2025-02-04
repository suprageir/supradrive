import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const token = req.cookies.get("supradrivetoken");

    if (
        pathname.startsWith("/_next/") ||
        pathname.startsWith("/static/") ||
        pathname.startsWith("/api/") ||
        pathname.endsWith(".png") || pathname.endsWith(".jpg") ||
        pathname.endsWith(".css") || pathname.endsWith(".js")
    ) {
        return NextResponse.next();
    }

    if (pathname === "/login") {
        return NextResponse.next();
    }

    if (!token) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!_next|static|api|login).*)"],
};
