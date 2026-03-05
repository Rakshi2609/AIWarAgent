import { NextRequest, NextResponse } from 'next/server';
import { auth } from './lib/auth';

export default auth((req: NextRequest & { auth: unknown }) => {
    const session = (req as unknown as { auth: { user?: { email?: string } } | null }).auth;
    const { pathname } = req.nextUrl;

    const protectedRoutes = ['/dashboard', '/submit'];
    const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));

    if (isProtected && !session?.user?.email) {
        const loginUrl = new URL('/login', req.url);
        loginUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
});

export const config = {
    matcher: ['/dashboard/:path*', '/submit/:path*'],
};
