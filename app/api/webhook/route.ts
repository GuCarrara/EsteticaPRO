import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import bcrypt from "bcryptjs";
import { Resend } from "resend";

function generatePassword() {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let password = "";
  for (let i = 0; i < 10; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

export async function POST(req: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY);

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
        return NextResponse.json({ ok: true });
      }

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

      await resend.emails.send({
        from: "EstéticaPro <contato@esteticapro.com.br>",
        to: customer.email,
        subject: "Bem-vindo ao EstéticaPro! Seus dados de acesso",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 32px;">
            <h1 style="color: #4F8EF7;">EstéticaPro</h1>
            <h2>Pagamento confirmado! 🎉</h2>
            <p>Olá, <strong>${customer.name}</strong>! Sua assinatura foi ativada com sucesso.</p>
            <p>Seus dados de acesso temporários:</p>
            <div style="background: #F8FAFC; border-radius: 12px; padding: 20px; margin: 24px 0; border: 1px solid #E2E8F0;">
              <p style="margin: 0 0 8px;"><strong>Email:</strong> ${customer.email}</p>
              <p style="margin: 0;"><strong>Senha temporária:</strong> ${password}</p>
            </div>
            <p style="color: #E11D48; font-weight: bold;">⚠️ Ao fazer login, você será solicitado a criar uma nova senha.</p>
            <a href="https://esteticapro.com.br/login" style="display: block; text-align: center; padding: 14px; background: #4F8EF7; color: #fff; border-radius: 10px; text-decoration: none; font-weight: bold; margin: 16px 0;">
              Acessar o EstéticaPro
            </a>
          </div>
        `,
      });

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

      await prisma.user.update({
        where: { email: customer.email },
        data: { isPaid: false },
      });

      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("ERRO WEBHOOK:", error);
    return NextResponse.json({ error: "Erro no webhook" }, { status: 500 });
  }
}