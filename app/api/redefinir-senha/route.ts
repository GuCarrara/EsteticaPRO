import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { email, code, password } = await req.json();

    if (!email || !code || !password) {
      return NextResponse.json({ error: "Preencha todos os campos" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    if (user.resetToken !== code) return NextResponse.json({ error: "Código inválido" }, { status: 400 });
    if (!user.resetTokenExpiry || new Date() > user.resetTokenExpiry) {
      return NextResponse.json({ error: "Código expirado. Solicite um novo." }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
        mustChangePassword: false,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("ERRO redefinir-senha:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}