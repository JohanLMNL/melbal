import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  // Le middleware laisse passer toutes les requêtes pages.
  // La protection auth se fait :
  //   - Côté client : chaque page vérifie la session Supabase (localStorage)
  //   - Côté API : chaque route /api/admin/* vérifie le Bearer token via requireAdmin()
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|logos|plans|images).*)', '/'],
}
