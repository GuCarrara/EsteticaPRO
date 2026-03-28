import { NextRequest, NextResponse } from "next/server";

const ASAAS_KEY = process.env.ASAAS_API_KEY;
const ASAAS_URL = process.env.ASAAS_URL;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, cpf, paymentMethod, card, plan, plano } = body;

    const selectedPlan = plan || plano || "mensal";

    if (!name || !email || !cpf) {
      return NextResponse.json({ error: "Preencha todos os campos" }, { status: 400 });
    }

    const cpfClean = cpf.replace(/\D/g, "");
    if (cpfClean.length !== 11) {
      return NextResponse.json({ error: "CPF inválido" }, { status: 400 });
    }

    const planConfig: Record<string, { value: number; descricao: string }> = {
      mensal:  { value: 97.90,  descricao: "Assinatura EstéticaPro Mensal" },
      anual:   { value: 957.80, descricao: "Assinatura EstéticaPro Anual" },
      premium: { value: 249.90, descricao: "Assinatura EstéticaPro Premium" },
    };

    const selected = planConfig[selectedPlan] || planConfig["mensal"];
    const { value: valor, descricao } = selected;

    const asaasHeaders = {
      "Content-Type": "application/json",
      "access_token": ASAAS_KEY!,
    };

    // 1. Verificar se cliente já existe
    const searchRes = await fetch(
      `${ASAAS_URL}/customers?email=${encodeURIComponent(email)}`,
      { headers: asaasHeaders }
    );
    const searchText = await searchRes.text();
    console.log("Busca cliente Asaas:", searchText);
    const searchData = JSON.parse(searchText);

    let customerId: string;

    if (searchData.data && searchData.data.length > 0) {
      customerId = searchData.data[0].id;
      console.log("Cliente existente reutilizado:", customerId);
    } else {
      // 2. Criar novo cliente
      const customerRes = await fetch(`${ASAAS_URL}/customers`, {
        method: "POST",
        headers: asaasHeaders,
        body: JSON.stringify({ name, email, cpfCnpj: cpfClean }),
      });

      const customerText = await customerRes.text();
      console.log("Cliente criado Asaas:", customerText);
      const customer = JSON.parse(customerText);

      if (!customer.id) {
        return NextResponse.json(
          { error: customer.errors?.[0]?.description || "Erro ao criar cliente" },
          { status: 500 }
        );
      }

      customerId = customer.id;
    }

    // 3. Criar cobrança
    const dueDate = new Date(Date.now() + 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    const paymentBody: any = {
      customer: customerId,
      billingType: paymentMethod || "PIX",
      value: valor,
      dueDate,
      description: descricao,
    };

    if (paymentMethod === "CREDIT_CARD" && card) {
      paymentBody.creditCard = {
        holderName: card.holderName,
        number: card.number.replace(/\D/g, ""),
        expiryMonth: card.expiryMonth,
        expiryYear: card.expiryYear,
        ccv: card.cvv,
      };
      paymentBody.creditCardHolderInfo = {
        name,
        email,
        cpfCnpj: cpfClean,
      };
    }

    const paymentRes = await fetch(`${ASAAS_URL}/payments`, {
      method: "POST",
      headers: asaasHeaders,
      body: JSON.stringify(paymentBody),
    });

    const paymentText = await paymentRes.text();
    console.log("Pagamento Asaas:", paymentText);
    const payment = JSON.parse(paymentText);

    if (!payment.id) {
      return NextResponse.json(
        { error: payment.errors?.[0]?.description || "Erro ao criar cobrança" },
        { status: 500 }
      );
    }

    // 4. Cartão de crédito
    if (paymentMethod === "CREDIT_CARD") {
      if (payment.status === "CONFIRMED" || payment.status === "RECEIVED") {
        return NextResponse.json({ success: true });
      } else {
        return NextResponse.json(
          { error: "Cartão recusado. Verifique os dados." },
          { status: 400 }
        );
      }
    }

    // 5. PIX — buscar QR Code
    const pixRes = await fetch(
      `${ASAAS_URL}/payments/${payment.id}/pixQrCode`,
      { headers: asaasHeaders }
    );

    const pixText = await pixRes.text();
    console.log("PIX QrCode:", pixText);
    const pix = JSON.parse(pixText);

    if (!pix.payload) {
      return NextResponse.json({ error: "Erro ao gerar PIX" }, { status: 500 });
    }

    return NextResponse.json({
      paymentId: payment.id,
      pixCode: pix.payload,
      pixImage: pix.encodedImage,
    });

  } catch (error) {
    console.error("ERRO BILLING:", error);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}