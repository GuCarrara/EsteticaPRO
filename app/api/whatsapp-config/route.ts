import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import prisma from "@/app/lib/prisma";

const EVOLUTION_URL = process.env.EVOLUTION_API_URL;
const EVOLUTION_KEY = process.env.EVOLUTION_API_KEY;

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, planType: true, evolutionInstance: true, phone: true },
    });

    if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    if (user.planType !== "premium") return NextResponse.json({ error: "Acesso restrito ao plano Premium" }, { status: 403 });

    let status = "disconnected";
    let qrcode = null;

    if (user.evolutionInstance) {
      try {
        const res = await fetch(`${EVOLUTION_URL}/instance/connectionState/${user.evolutionInstance}`, {
          headers: { "apikey": EVOLUTION_KEY! },
        });
        const data = await res.json();
        status = data?.instance?.state === "open" ? "connected" : "disconnected";
      } catch {
        status = "disconnected";
      }

      // Se desconectado, busca QR Code
      if (status === "disconnected") {
        try {
          const res = await fetch(`${EVOLUTION_URL}/instance/connect/${user.evolutionInstance}`, {
            headers: { "apikey": EVOLUTION_KEY! },
          });
          const data = await res.json();
          qrcode = data?.base64 || null;
        } catch {
          qrcode = null;
        }
      }
    }

    return NextResponse.json({
      instance: user.evolutionInstance,
      status,
      qrcode,
      phone: user.phone,
    });
  } catch (error) {
    console.error("ERRO whatsapp-config GET:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, planType: true, evolutionInstance: true },
    });

    if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    if (user.planType !== "premium") return NextResponse.json({ error: "Acesso restrito ao plano Premium" }, { status: 403 });

    const { action } = await req.json();

    // Reconectar — gera novo QR Code
   if (action === "reconnect") {
      if (!user.evolutionInstance) return NextResponse.json({ error: "Instância não configurada" }, { status: 400 });

      const res = await fetch(`${EVOLUTION_URL}/instance/connect/${user.evolutionInstance}`, {
        headers: { "apikey": EVOLUTION_KEY! },
      });
      const data = await res.json();
      return NextResponse.json({ qrcode: data?.base64 || null });
    }

    return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
  } catch (error) {
    console.error("ERRO whatsapp-config POST:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}