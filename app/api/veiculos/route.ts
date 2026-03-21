import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import prisma from "@/app/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get("clientId");

    const vehicles = await prisma.vehicle.findMany({
      where: clientId ? { clientId } : {},
      include: { client: true },
    });

    return NextResponse.json(vehicles);
  } catch (error) {
    console.error("GET veiculos error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const body = await req.json();

    const vehicle = await prisma.vehicle.create({
      data: {
        clientId: body.clientId,
        brand: body.brand,
        model: body.model,
        year: body.year ? Number(body.year) : null,
        plate: body.plate || null,
        color: body.color || null,
      },
    });

    return NextResponse.json(vehicle);
  } catch (error) {
    console.error("POST veiculos error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID não informado" }, { status: 400 });

    await prisma.vehicle.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE veiculos error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}