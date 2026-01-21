import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    // Vous pouvez ajouter des vérifications supplémentaires ici
    // Par exemple, vérifier les rôles pour certaines routes
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: '/login',
    },
  }
);

// Protéger toutes les routes du dashboard
export const config = {
  matcher: ['/dashboard/:path*', '/(dashboard)/:path*'],
};
