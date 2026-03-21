import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import prisma from "@/app/lib/prisma";

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