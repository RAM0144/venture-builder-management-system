import { withAuth } from "next-auth/middleware"  // ✅ curly braces
import { NextResponse } from "next/server"

export default withAuth(
    function middleware(req) {

        const token = req.nextauth.token
        const path  = req.nextUrl.pathname

        // ── ADMIN protection ──────────────────────────────
        // non-admin trying to access /admin
        if (path.startsWith("/admin") && token?.role !== "ADMIN") {
            return NextResponse.redirect(new URL("/login", req.url))
        }

        // ── VB protection ─────────────────────────────────
        // non-VB trying to access /vb
        if (path.startsWith("/VB-dashboard") && token?.role !== "VB") {
            return NextResponse.redirect(new URL("/login", req.url))
        }

        // ── HUB protection ────────────────────────────────
        // non-hub trying to access /hub
        if (path.startsWith("/hub") && token?.role !== "HUB") {
            return NextResponse.redirect(new URL("/login", req.url))
        }

        // ── Role based redirect after login ───────────────
        // ADMIN trying to access /vb
        if (path.startsWith("/VB-dashboard") && token?.role === "ADMIN") {
            return NextResponse.redirect(new URL("/admin", req.url))
        }

        // VB trying to access /admin
        if (path.startsWith("/admin") && token?.role === "VB") {
            return NextResponse.redirect(new URL("/VB-dashboard", req.url))
        }

        // HUB trying to access /admin
        if (path.startsWith("/admin") && token?.role === "HUB") {
            return NextResponse.redirect(new URL("/hub", req.url))
        }

        return NextResponse.next()
    },
    {
        callbacks: {
            // ✅ user must be logged in to access protected routes
            authorized: ({ token }) => !!token
        },
        pages: {
            signIn: "/login"
        }
    }
)

export const config = {
    matcher: [
        "/admin/:path*",   // ✅ all admin routes
        "/VB-dashboard/:path*",      // ✅ all VB routes (not /VB-dashboard)
        "/hub/:path*"      // ✅ fixed from /hub/:hub*
    ]
}