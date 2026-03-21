import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import prisma from "@/app/lib/prisma";

const ASAAS_KEY = process.env.ASAAS_API_KEY;
const ASAAS_URL = process.env.ASAAS_URL;

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        isPaid: true,
        asaasSubscriptionId: true,
      },
    });

    if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    if (!user.isPaid) return NextResponse.json({ error: "Assinatura não ativa" }, { status: 400 });
    if (!user.asaasSubscriptionId) return NextResponse.json({ error: "ID da assinatura não encontrado" }, { status: 400 });

    const res = await fetch(`${ASAAS_URL}/subscriptions/${user.asaasSubscriptionId}`, {
      method: "DELETE",
      headers: {
        "access_token": ASAAS_KEY!,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const err = await res.json();
      console.error("Erro Asaas cancelamento:", err);
      return NextResponse.json({ error: "Erro ao cancelar no Asaas" }, { status: 500 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { asaasSubscriptionId: null },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("ERRO CANCELAMENTO:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}