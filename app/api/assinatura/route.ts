import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import prisma from "@/app/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        isPaid: true,
        planType: true,
        paidAt: true,
        planExpiresAt: true,
      },
    });

    if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });

    const now = new Date();
    const expiresAt = user.planExpiresAt ? new Date(user.planExpiresAt) : null;
    const daysLeft = expiresAt
      ? Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      : null;

    return NextResponse.json({
      isPaid: user.isPaid,
      planType: user.planType,
      paidAt: user.paidAt,
      planExpiresAt: user.planExpiresAt,
      daysLeft,
    });
  } catch (error) {
    console.error("ERRO ASSINATURA:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}