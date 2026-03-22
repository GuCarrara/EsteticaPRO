import { NextRequest, NextResponse } from "next/server";

const ASAAS_KEY = process.env.ASAAS_API_KEY;
const ASAAS_URL = process.env.ASAAS_URL;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, cpf, phone, plan } = body;

    if (!name || !email || !cpf || !plan) {
      return NextResponse.json({ error: "Preencha todos os campos" }, { status: 400 });
    }

    // 1. Criar ou buscar cliente no Asaas
    const customerRes = await fetch(`${ASAAS_URL}/customers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "access_token": ASAAS_KEY!,
      },
      body: JSON.stringify({
        name,
        email,
        cpfCnpj: cpf.replace(/\D/g, ""),
        mobilePhone: phone?.replace(/\D/g, "") || undefined,
      }),
    });

    const customer = await customerRes.json();
    if (!customer.id) {
      return NextResponse.json({ error: "Erro ao criar cliente no Asaas" }, { status: 500 });
    }

    // 2. Definir valor e ciclo pelo plano
    const planConfig = {
      mensal: { value: 97.90, cycle: "MONTHLY" },
      anual: { value: 957.80, cycle: "YEARLY" },
    };

    const selectedPlan = planConfig[plan as keyof typeof planConfig];
    if (!selectedPlan) {
      return NextResponse.json({ error: "Plano inválido" }, { status: 400 });
    }

    // 3. Criar assinatura no Asaas
    const subscriptionRes = await fetch(`${ASAAS_URL}/subscriptions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "access_token": ASAAS_KEY!,
      },
      body: JSON.stringify({
        customer: customer.id,
        billingType: "UNDEFINED",
        value: selectedPlan.value,
        cycle: selectedPlan.cycle,
        description: `EstéticaPro — Plano ${plan.charAt(0).toUpperCase() + plan.slice(1)}`,
        nextDueDate: new Date().toISOString().split("T")[0],
      }),
    });

    const subscription = await subscriptionRes.json();
    if (!subscription.id) {
      return NextResponse.json({ error: "Erro ao criar assinatura" }, { status: 500 });
    }

    // 4. Buscar link de pagamento
    const paymentRes = await fetch(`${ASAAS_URL}/subscriptions/${subscription.id}/payments`, {
      headers: { "access_token": ASAAS_KEY! },
    });

    const payments = await paymentRes.json();
    const firstPayment = payments.data?.[0];

    if (!firstPayment) {
      return NextResponse.json({ error: "Erro ao buscar pagamento" }, { status: 500 });
    }

    // 5. Buscar link do boleto/pix
    const linkRes = await fetch(`${ASAAS_URL}/payments/${firstPayment.id}/paymentLink`, {
      headers: { "access_token": ASAAS_KEY! },
    });

    const linkData = await linkRes.json();

    return NextResponse.json({
      ok: true,
      paymentId: firstPayment.id,
      paymentLink: linkData.url || `https://sandbox.asaas.com/i/${firstPayment.id}`,
      subscriptionId: subscription.id,
    });

  } catch (error) {
    console.error("ERRO BILLING:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}