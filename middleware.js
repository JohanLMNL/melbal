import { NextResponse } from 'next/server';

// Pages publiques accessibles sans connexion
const publicPages = ['/login'];

export function middleware(req) {
  const { pathname } = req.nextUrl;

  // Permettre l'accès à la page de login et aux fichiers statiques
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    publicPages.includes(pathname)
  ) {
    return NextResponse.next();
  }

  // Récupérer le cookie de session personnalisé (userSession)
  const userSessionCookie = req.cookies.get('userSession');

  // Si le cookie n'existe pas, rediriger vers /login
  if (!userSessionCookie) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Vérifier les informations du cookie (userSession)
  const userSession = JSON.parse(userSessionCookie.value);

  // Vérifier si isActive est false et rediriger vers /login si c'est le cas
  if (!userSession.isActive) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Restreindre l'accès à la page /users et tous ses sous-chemins aux utilisateurs ayant les rôles 'boss' ou 'admin'
  if (
    pathname.startsWith('/users') &&
    !['boss', 'admin'].includes(userSession.role)
  ) {
    // Rediriger vers une autre page si l'utilisateur n'a pas les rôles 'boss' ou 'admin'
    return NextResponse.redirect(new URL('/dashboard', req.url)); // Tu peux modifier l'URL si besoin
  }

  // Si tout est correct, laisser passer la requête
  return NextResponse.next();
}
