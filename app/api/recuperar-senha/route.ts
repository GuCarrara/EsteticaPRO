import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

const EVOLUTION_URL = process.env.EVOLUTION_API_URL;
const EVOLUTION_KEY = process.env.EVOLUTION_API_KEY;
const EVOLUTION_INSTANCE = process.env.EVOLUTION_INSTANCE;

async function sendWhatsApp(phone: string, message: string) {
  try {
    const number = phone.replace(/\D/g, "");
    await fetch(`${EVOLUTION_URL}/message/sendText/${EVOLUTION_INSTANCE}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": EVOLUTION_KEY!,
      },
      body: JSON.stringify({ number: `55${number}`, text: message }),
    });
  } catch (err) {
    console.error("Erro WhatsApp recuperar-senha:", err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Informe o e-mail" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: "E-mail não encontrado" }, { status: 404 });
    if (!user.phone) return NextResponse.json({ error: "Nenhum WhatsApp cadastrado para este e-mail" }, { status: 400 });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.user.update({
      where: { email },
      data: { resetToken: code, resetTokenExpiry: expiresAt },
    });

    await sendWhatsApp(user.phone,
      `🚗 *EstéticaPro*\n\n` +
      `Olá, *${user.name}*!\n\n` +
      `Seu código de recuperação de senha é:\n\n` +
      `*${code}*\n\n` +
      `⏱️ Válido por 15 minutos.\n\n` +
      `Se não foi você, ignore esta mensagem.`
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("ERRO recuperar-senha:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}