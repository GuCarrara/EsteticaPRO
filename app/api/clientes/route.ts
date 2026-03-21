import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import prisma from "@/app/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });

    const clients = await prisma.client.findMany({
      where: { userId: user.id },
      include: { vehicles: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(clients);
  } catch (error) {
    console.error("GET clientes error:", error);
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
    const client = await prisma.client.create({
      data: {
        userId: user.id,
        name: body.name,
        phone: body.phone || null,
        email: body.email || null,
        cpf: body.cpf || null,
      },
    });

    return NextResponse.json(client);
  } catch (error) {
    console.error("POST clientes error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const body = await req.json();
    const client = await prisma.client.update({
      where: { id: body.id },
      data: {
        name: body.name,
        phone: body.phone || null,
        email: body.email || null,
        cpf: body.cpf || null,
      },
    });

    return NextResponse.json(client);
  } catch (error) {
    console.error("PUT clientes error:", error);
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

    const client = await prisma.client.findFirst({ where: { id, userId: user.id } });
    if (!client) return NextResponse.json({ error: "Não autorizado" }, { status: 403 });

    await prisma.vehicle.deleteMany({ where: { clientId: id } });
    await prisma.client.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE clientes error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}