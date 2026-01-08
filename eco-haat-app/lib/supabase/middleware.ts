import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // Get user session
    const {
        data: { user },
    } = await supabase.auth.getUser()

    // Define protected routes
    const protectedRoutes = ['/admin', '/seller', '/cart', '/checkout']
    const adminRoutes = ['/admin']
    const sellerRoutes = ['/seller']

    const isProtectedRoute = protectedRoutes.some(route =>
        request.nextUrl.pathname.startsWith(route)
    )
    const isAdminRoute = adminRoutes.some(route =>
        request.nextUrl.pathname.startsWith(route)
    )
    const isSellerRoute = sellerRoutes.some(route =>
        request.nextUrl.pathname.startsWith(route)
    )

    // Redirect to login if accessing protected route without auth
    if (isProtectedRoute && !user) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        url.searchParams.set('redirect', request.nextUrl.pathname)
        return NextResponse.redirect(url)
    }

    // Role-based access control
    if (user && (isAdminRoute || isSellerRoute)) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (isAdminRoute && profile?.role !== 'admin') {
            return NextResponse.redirect(new URL('/', request.url))
        }

        if (isSellerRoute && profile?.role !== 'seller' && profile?.role !== 'admin') {
            return NextResponse.redirect(new URL('/', request.url))
        }
    }

    return supabaseResponse
}
