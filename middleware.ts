import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const pathname = req.nextUrl.pathname;

  const isPublic =
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/assinar" ||
    pathname === "/obrigado" ||
    pathname === "/trocar-senha" ||
    pathname === "/recuperar-senha" ||
    pathname === "/redefinir-senha" ||
    pathname === "/definir-senha" ||
    pathname === "/termos-de-uso" ||
    pathname === "/politica-de-privacidade" ||
    pathname.startsWith("/api/recuperar-senha") ||
    pathname.startsWith("/api/redefinir-senha") ||
    pathname.startsWith("/api/auth-code") ||
    pathname.startsWith("/api/whatsapp-webhook") ||
    pathname.startsWith("/api/whatsapp-config");
    pathname.startsWith("/api/register") ||
    pathname.startsWith("/api/webhook") ||
    pathname.startsWith("/api/billing") ||
    pathname.startsWith("/api/check-payment") ||
    pathname.startsWith("/api/assinatura") ||
    pathname.startsWith("/api/auth-code");

  if (isPublic) return NextResponse.next();

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  const isAllowedBlocked =
    pathname === "/assinatura" ||
    pathname === "/suporte";

  const planExpired = token.planExpiresAt
    ? new Date() > new Date(token.planExpiresAt as string)
    : false;

  if (!isAllowedBlocked && (token.isPaid === false || planExpired)) {
    return NextResponse.redirect(new URL("/assinatura", req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.svg|.*\\.webp|.*\\.ico).*)"],
};