import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import bcrypt from "bcryptjs";

const EVOLUTION_URL = process.env.EVOLUTION_API_URL;
const EVOLUTION_KEY = process.env.EVOLUTION_API_KEY;
const EVOLUTION_INSTANCE = process.env.EVOLUTION_INSTANCE;

function generatePassword() {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let password = "";
  for (let i = 0; i < 10; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

async function sendWhatsApp(phone: string, message: string) {
  try {
    const number = phone.replace(/\D/g, "");
    const res = await fetch(`${EVOLUTION_URL}/message/sendText/${EVOLUTION_INSTANCE}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": EVOLUTION_KEY!,
      },
      body: JSON.stringify({ number: `55${number}`, text: message }),
    });
    console.log("WhatsApp enviado:", res.status);
  } catch (err) {
    console.error("Erro ao enviar WhatsApp:", err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get("asaas-access-token");
    if (!token || token !== process.env.ASAAS_WEBHOOK_TOKEN) {
      console.warn("Webhook bloqueado — token inválido");
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await req.json();
    console.log("Webhook Asaas:", JSON.stringify(body));

    if (body.event === "PAYMENT_CONFIRMED" || body.event === "PAYMENT_RECEIVED") {
      const payment = body.payment;
      if (!payment) return NextResponse.json({ ok: true });

      const customerRes = await fetch(`${process.env.ASAAS_URL}/customers/${payment.customer}`, {
        headers: { "access_token": process.env.ASAAS_API_KEY! },
      });
      const customer = await customerRes.json();
      if (!customer.email) return NextResponse.json({ error: "Email não encontrado" }, { status: 400 });

      const valor = payment.value;
      const planType = valor >= 200 ? "premium" : "mensal";
      const paidAt = new Date();
      const planExpiresAt = new Date(paidAt.getTime() + 30 * 24 * 60 * 60 * 1000);

      const existingUser = await prisma.user.findUnique({ where: { email: customer.email } });

      if (existingUser) {
        await prisma.user.update({
          where: { email: customer.email },
          data: {
            isPaid: true,
            paidAt,
            planExpiresAt,
            planType,
            asaasCustomerId: payment.customer,
            asaasSubscriptionId: payment.subscription ?? null,
          },
        });

        const phone = customer.mobilePhone || customer.phone || existingUser.phone;
        if (phone) {
          await sendWhatsApp(phone,
            `🚗 *EstéticaPro*\n\n` +
            `Olá, *${existingUser.name}*! ✅\n\n` +
            `Seu pagamento foi confirmado e seu acesso foi renovado por mais 30 dias!\n\n` +
            `Acesse: estetica-pro-ten.vercel.app/login`
          );
        }

        return NextResponse.json({ ok: true });
      }

      // Novo usuário
      const password = generatePassword();
      const hashedPassword = await bcrypt.hash(password, 10);

      await prisma.user.create({
        data: {
          name: customer.name,
          email: customer.email,
          password: hashedPassword,
          isPaid: true,
          mustChangePassword: true,
          planType,
          paidAt,
          planExpiresAt,
          asaasCustomerId: payment.customer,
          asaasSubscriptionId: payment.subscription ?? null,
        },
      });

      console.log("Novo usuário criado:", customer.email);

      const phone = customer.mobilePhone || customer.phone;
      if (phone) {
        await sendWhatsApp(phone,
          `🚗 *Bem-vindo ao EstéticaPro!* 🎉\n\n` +
          `Olá, *${customer.name}*!\n\n` +
          `Seu pagamento foi confirmado! Aqui estão seus dados de acesso:\n\n` +
          `📧 *E-mail:* ${customer.email}\n` +
          `🔑 *Senha temporária:* ${password}\n\n` +
          `⚠️ Ao fazer login, você será solicitado a criar uma nova senha.\n\n` +
          `👉 Acesse agora: estetica-pro-ten.vercel.app/login`
        );
      }

      return NextResponse.json({ ok: true });
    }

    if (body.event === "PAYMENT_OVERDUE") {
      const payment = body.payment;
      if (!payment) return NextResponse.json({ ok: true });

      const customerRes = await fetch(`${process.env.ASAAS_URL}/customers/${payment.customer}`, {
        headers: { "access_token": process.env.ASAAS_API_KEY! },
      });
      const customer = await customerRes.json();
      if (!customer.email) return NextResponse.json({ ok: true });

      // Verifica se usuário existe antes de atualizar
      const user = await prisma.user.findUnique({ where: { email: customer.email } });
      if (!user) {
        console.log("Usuário não encontrado para PAYMENT_OVERDUE:", customer.email);
        return NextResponse.json({ ok: true });
      }

      await prisma.user.update({
        where: { email: customer.email },
        data: { isPaid: false },
      });

      const phone = customer.mobilePhone || customer.phone || user.phone;
      if (phone) {
        await sendWhatsApp(phone,
          `🚗 *EstéticaPro*\n\n` +
          `Olá, *${customer.name}*! ⚠️\n\n` +
          `Identificamos um pagamento em atraso em sua conta.\n\n` +
          `Para continuar usando o sistema, acesse:\n` +
          `👉 estetica-pro-ten.vercel.app/assinatura`
        );
      }

      console.log("Acesso bloqueado por inadimplência:", customer.email);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("ERRO WEBHOOK:", error);
    return NextResponse.json({ error: "Erro no webhook" }, { status: 500 });
  }
}