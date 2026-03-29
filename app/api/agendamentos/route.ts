import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import prisma from "@/app/lib/prisma";

const EVOLUTION_URL = process.env.EVOLUTION_API_URL;
const EVOLUTION_KEY = process.env.EVOLUTION_API_KEY;

async function sendWhatsApp(instance: string, phone: string, message: string) {
  try {
    const number = phone.replace(/\D/g, "");
    if (!number || number.length < 10) return;
    await fetch(`${EVOLUTION_URL}/message/sendText/${instance}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "apikey": EVOLUTION_KEY!,
      },
      body: JSON.stringify({ number: `55${number}`, text: message }),
    });
  } catch (err) {
    console.error("Erro WhatsApp agendamento:", err);
  }
}

function formatDate(date: Date) {
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function formatTime(date: Date) {
  return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });

    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");

    const where: any = { userId: user.id };

    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      where.date = { gte: start, lte: end };
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        client: true,
        vehicle: true,
        service: true,
      },
      orderBy: { date: "asc" },
    });

    return NextResponse.json(appointments);
  } catch (error) {
    console.error("GET agendamentos error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });

    const body = await req.json();

    const appointment = await prisma.appointment.create({
      data: {
        userId: user.id,
        clientId: body.clientId,
        vehicleId: body.vehicleId,
        serviceId: body.serviceId,
        date: new Date(body.date),
        status: "pending",
        notes: body.notes || null,
      },
      include: {
        client: true,
        vehicle: true,
        service: true,
      },
    });

    // Envia WhatsApp para o cliente final se tiver instância configurada
    if ((user as any).evolutionInstance && appointment.client.phone) {
      const apptDate = new Date(appointment.date);
      await sendWhatsApp(
        (user as any).evolutionInstance,
        appointment.client.phone,
        `🚗 *Agendamento confirmado!*\n\n` +
        `Olá, *${appointment.client.name}*! Seu agendamento foi registrado com sucesso.\n\n` +
        `📅 *Data:* ${formatDate(apptDate)}\n` +
        `🕐 *Horário:* ${formatTime(apptDate)}\n` +
        `✨ *Serviço:* ${appointment.service.name}\n` +
        `🚗 *Veículo:* ${appointment.vehicle.brand} ${appointment.vehicle.model}` +
        `${appointment.vehicle.plate ? ` (${appointment.vehicle.plate})` : ""}\n\n` +
        `Qualquer dúvida, entre em contato. Te esperamos! 😊`
      );
    }

    return NextResponse.json(appointment);
  } catch (error) {
    console.error("POST agendamentos error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });

    const body = await req.json();

    const appointment = await prisma.appointment.findFirst({ where: { id: body.id, userId: user.id } });
    if (!appointment) return NextResponse.json({ error: "Não autorizado" }, { status: 403 });

    const updated = await prisma.appointment.update({
      where: { id: body.id },
      data: {
        ...(body.status && { status: body.status }),
        ...(body.date && { date: new Date(body.date) }),
        ...(body.notes !== undefined && { notes: body.notes }),
      },
      include: {
        client: true,
        vehicle: true,
        service: true,
      },
    });

    // Envia WhatsApp quando status muda
    if ((user as any).evolutionInstance && updated.client.phone && body.status) {
      const apptDate = new Date(updated.date);
      let message = "";

      if (body.status === "confirmed") {
        message =
          `✅ *Agendamento confirmado!*\n\n` +
          `Olá, *${updated.client.name}*! Seu agendamento foi confirmado.\n\n` +
          `📅 *Data:* ${formatDate(apptDate)}\n` +
          `🕐 *Horário:* ${formatTime(apptDate)}\n` +
          `✨ *Serviço:* ${updated.service.name}\n` +
          `🚗 *Veículo:* ${updated.vehicle.brand} ${updated.vehicle.model}` +
          `${updated.vehicle.plate ? ` (${updated.vehicle.plate})` : ""}\n\n` +
          `Te esperamos! 😊`;
      } else if (body.status === "completed") {
        message =
          `🎉 *Serviço concluído!*\n\n` +
          `Olá, *${updated.client.name}*! O serviço do seu veículo foi concluído.\n\n` +
          `✨ *Serviço:* ${updated.service.name}\n` +
          `🚗 *Veículo:* ${updated.vehicle.brand} ${updated.vehicle.model}` +
          `${updated.vehicle.plate ? ` (${updated.vehicle.plate})` : ""}\n\n` +
          `Obrigado pela preferência! Volte sempre. 🚗`;
      } else if (body.status === "cancelled") {
        message =
          `❌ *Agendamento cancelado*\n\n` +
          `Olá, *${updated.client.name}*! Infelizmente seu agendamento foi cancelado.\n\n` +
          `📅 *Data:* ${formatDate(apptDate)}\n` +
          `✨ *Serviço:* ${updated.service.name}\n\n` +
          `Entre em contato para remarcar. 😊`;
      }

      if (message) {
        await sendWhatsApp((user as any).evolutionInstance, updated.client.phone, message);
      }
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT agendamentos error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID não informado" }, { status: 400 });

    const appointment = await prisma.appointment.findFirst({ where: { id, userId: user.id } });
    if (!appointment) return NextResponse.json({ error: "Não autorizado" }, { status: 403 });

    await prisma.appointment.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE agendamentos error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}