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

    const services = await prisma.service.findMany({
      where: { userId: user.id, ativo: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(services);
  } catch (error) {
    console.error("GET servicos error:", error);
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
    const service = await prisma.service.create({
      data: {
        userId: user.id,
        name: body.name,
        description: body.description || null,
        price: Number(body.price),
        duration: Number(body.duration) || 60,
      },
    });

    return NextResponse.json(service);
  } catch (error) {
    console.error("POST servicos error:", error);
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

    const service = await prisma.service.findFirst({ where: { id: body.id, userId: user.id } });
    if (!service) return NextResponse.json({ error: "Não autorizado" }, { status: 403 });

    const updated = await prisma.service.update({
      where: { id: body.id },
      data: {
        name: body.name,
        description: body.description || null,
        price: Number(body.price),
        duration: Number(body.duration) || 60,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT servicos error:", error);
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

    const service = await prisma.service.findFirst({ where: { id, userId: user.id } });
    if (!service) return NextResponse.json({ error: "Não autorizado" }, { status: 403 });

    await prisma.service.update({ where: { id }, data: { ativo: false } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE servicos error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}