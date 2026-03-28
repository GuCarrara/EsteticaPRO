import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import bcrypt from "bcryptjs";

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
    console.error("Erro WhatsApp verify:", err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone } = await req.json();

    if (!name || !email || !phone) {
      return NextResponse.json({ error: "Preencha todos os campos" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing && existing.isPaid) {
      return NextResponse.json({ error: "E-mail já cadastrado. Faça login." }, { status: 400 });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.user.upsert({
      where: { email },
      update: { name, phone: phone || null, resetToken: code, resetTokenExpiry: expiresAt },
      create: { name, email, phone: phone || null, password: "", isPaid: false, resetToken: code, resetTokenExpiry: expiresAt },
    });

    // Envia código via WhatsApp
    await sendWhatsApp(phone,
      `🚗 *EstéticaPro*\n\n` +
      `Olá, *${name}*! Seu código de verificação é:\n\n` +
      `*${code}*\n\n` +
      `⏱️ Válido por 15 minutos.\n\n` +
      `Se não foi você, ignore esta mensagem.`
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("ERRO auth-code POST:", error);
    return NextResponse.json({ error: "Erro ao enviar código" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { email, code, password } = await req.json();

    if (!email || !code) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    if (user.resetToken !== code) return NextResponse.json({ error: "Código inválido" }, { status: 400 });
    if (!user.resetTokenExpiry || new Date() > user.resetTokenExpiry) {
      return NextResponse.json({ error: "Código expirado. Solicite um novo." }, { status: 400 });
    }

    const tempPassword = password || Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    const trialExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
        isPaid: true,
        planType: "trial",
        paidAt: new Date(),
        planExpiresAt: trialExpiresAt,
        mustChangePassword: false,
      },
    });

    // Boas-vindas via WhatsApp
    if (user.phone) {
      await sendWhatsApp(user.phone,
        `🚗 *Bem-vindo ao EstéticaPro!*\n\n` +
        `Sua conta foi ativada com sucesso!\n\n` +
        `🎁 Você tem *7 dias grátis* para testar o sistema.\n\n` +
        `Acesse agora: estetica-pro-ten.vercel.app/login`
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("ERRO auth-code PUT:", error);
    return NextResponse.json({ error: "Erro ao ativar conta" }, { status: 500 });
  }
}