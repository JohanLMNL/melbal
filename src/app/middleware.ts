import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  // Pour l'instant, on laisse passer toutes les requêtes
  // Le middleware d'auth sera géré côté client
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|icon-.*\\.png|api).*)',
  ],
}
