import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
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
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { name, email, phone } = await req.json();

    if (!name || !email) {
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

    await resend.emails.send({
      from: "EstéticaPro <contato@esteticapro.com.br>",
      to: email,
      subject: "Seu código de verificação — EstéticaPro",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
          <h1 style="color: #4F8EF7; font-size: 24px;">🚗 EstéticaPro</h1>
          <p>Olá, <strong>${name}</strong>! Use o código abaixo para ativar sua conta:</p>
          <div style="background: #F8FAFC; border-radius: 16px; padding: 32px; text-align: center; margin: 24px 0; border: 2px solid #E2E8F0;">
            <div style="font-size: 48px; font-weight: 900; letter-spacing: 12px; color: #1E293B;">${code}</div>
            <p style="color: #64748B; font-size: 13px; margin-top: 12px;">Válido por 15 minutos</p>
          </div>
          <p style="color: #64748B; font-size: 13px;">Se você não solicitou este código, ignore este e-mail.</p>
        </div>
      `,
    });

    if (phone) {
      await sendWhatsApp(phone,
        `🚗 *EstéticaPro*\n\nOlá, *${name}*! Seu código de verificação é:\n\n*${code}*\n\n⏱️ Válido por 15 minutos.`
      );
    }

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

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("ERRO auth-code PUT:", error);
    return NextResponse.json({ error: "Erro ao ativar conta" }, { status: 500 });
  }
}