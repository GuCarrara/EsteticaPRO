import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

const EVOLUTION_URL = process.env.EVOLUTION_API_URL;
const EVOLUTION_KEY = process.env.EVOLUTION_API_KEY;

async function sendWhatsApp(instance: string, phone: string, message: string) {
  try {
    const number = phone.replace(/\D/g, "");
    await fetch(`${EVOLUTION_URL}/message/sendText/${instance}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "apikey": EVOLUTION_KEY!,
      },
      body: JSON.stringify({ number: `55${number}`, text: message }),
    });
  } catch (err) {
    console.error("Erro ao enviar WhatsApp:", err);
  }
}

function formatDate(dateStr: string): Date | null {
  // Aceita dd/mm ou dd/mm/yyyy
  const parts = dateStr.trim().split("/");
  if (parts.length < 2) return null;
  const day = parseInt(parts[0]);
  const month = parseInt(parts[1]) - 1;
  const year = parts[2] ? parseInt(parts[2]) : new Date().getFullYear();
  const date = new Date(year, month, day);
  if (isNaN(date.getTime())) return null;
  return date;
}

function formatTime(timeStr: string): { hour: number; minute: number } | null {
  // Aceita HH:MM ou HHhMM ou HH
  const cleaned = timeStr.trim().replace("h", ":").replace("H", ":");
  const parts = cleaned.split(":");
  const hour = parseInt(parts[0]);
  const minute = parts[1] ? parseInt(parts[1]) : 0;
  if (isNaN(hour) || hour < 0 || hour > 23) return null;
  if (isNaN(minute) || minute < 0 || minute > 59) return null;
  return { hour, minute };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("WhatsApp Webhook:", JSON.stringify(body));

    // Verifica se é mensagem válida
    const message = body?.data?.message?.conversation || body?.data?.message?.extendedTextMessage?.text;
    const from = body?.data?.key?.remoteJid;
    const fromMe = body?.data?.key?.fromMe;
    const instanceName = body?.instance;

    if (!message || !from || fromMe) return NextResponse.json({ ok: true });

    // Extrai número do telefone
    const phone = from.replace("@s.whatsapp.net", "").replace("55", "");
    const text = message.trim().toLowerCase();

    // Busca usuário dono da instância
    const user = await (prisma as any).user.findFirst({
      where: { evolutionInstance: instanceName },
      include: { services: { where: { ativo: true } } },
    });

    if (!user) return NextResponse.json({ ok: true });

    // Busca ou cria estado da conversa
    let state = await (prisma as any).conversationState.findFirst({
      where: { userId: user.id, phone },
    });

    if (!state) {
      state = await (prisma as any).conversationState.create({
        data: { userId: user.id, phone, step: "menu", data: {} },
      });
    }

    const step = state.step;
    const data = state.data || {};

    // ── MENU PRINCIPAL ──
    if (step === "menu" || text === "oi" || text === "olá" || text === "ola" || text === "menu" || text === "0") {
      await sendWhatsApp(instanceName, phone,
        `🚗 *Olá! Bem-vindo à ${user.name}!* 😊\n\n` +
        `O que você precisa hoje?\n\n` +
        `1️⃣ Agendar um serviço\n` +
        `2️⃣ Ver meus agendamentos\n` +
        `3️⃣ Falar com atendente\n\n` +
        `_Digite o número da opção desejada_ 👇`
      );
      await (prisma as any).conversationState.update({
        where: { id: state.id },
        data: { step: "aguardando_menu", data: {}, updatedAt: new Date() },
      });
      return NextResponse.json({ ok: true });
    }

    // ── AGUARDANDO ESCOLHA DO MENU ──
    if (step === "aguardando_menu") {
      if (text === "1") {
        const services = user.services || [];
        if (services.length === 0) {
          await sendWhatsApp(instanceName, phone,
            `😕 Ainda não temos serviços cadastrados.\n\nEntre em contato diretamente com a gente! 😊`
          );
          await (prisma as any).conversationState.update({
            where: { id: state.id },
            data: { step: "menu", data: {}, updatedAt: new Date() },
          });
          return NextResponse.json({ ok: true });
        }

        const lista = services.map((s: any, i: number) =>
          `${i + 1}️⃣ *${s.name}* — R$ ${s.price ? parseFloat(s.price).toFixed(2).replace(".", ",") : "Consultar"}`
        ).join("\n");

        await sendWhatsApp(instanceName, phone,
          `✨ *Nossos serviços:*\n\n${lista}\n\n` +
          `_Digite o número do serviço desejado_ 👇\n\n` +
          `_(Digite 0 para voltar ao menu)_`
        );
        await (prisma as any).conversationState.update({
          where: { id: state.id },
          data: { step: "aguardando_servico", data: {}, updatedAt: new Date() },
        });
      } else if (text === "2") {
        // Busca agendamentos pelo telefone do cliente
        const appointments = await (prisma as any).appointment.findMany({
          where: {
            userId: user.id,
            client: { phone: { contains: phone } },
            date: { gte: new Date() },
            status: { not: "cancelled" },
          },
          include: { service: true, vehicle: true },
          orderBy: { date: "asc" },
          take: 3,
        });

        if (appointments.length === 0) {
          await sendWhatsApp(instanceName, phone,
            `📅 Você não tem agendamentos futuros.\n\n` +
            `Quer agendar um serviço? Digite *1* 😊`
          );
        } else {
          const lista = appointments.map((a: any) => {
            const date = new Date(a.date);
            return `📅 *${date.toLocaleDateString("pt-BR")}* às *${date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}*\n` +
              `✨ ${a.service.name}\n` +
              `🚗 ${a.vehicle.brand} ${a.vehicle.model}`;
          }).join("\n\n");

          await sendWhatsApp(instanceName, phone,
            `📅 *Seus próximos agendamentos:*\n\n${lista}\n\n` +
            `Digite *0* para voltar ao menu 😊`
          );
        }
        await (prisma as any).conversationState.update({
          where: { id: state.id },
          data: { step: "menu", data: {}, updatedAt: new Date() },
        });
      } else if (text === "3") {
        await sendWhatsApp(instanceName, phone,
          `👋 Ok! Um de nossos atendentes vai responder em breve.\n\n` +
          `_Horário de atendimento: segunda a sábado, das 8h às 18h_ 😊`
        );
        await (prisma as any).conversationState.update({
          where: { id: state.id },
          data: { step: "menu", data: {}, updatedAt: new Date() },
        });
      } else {
        await sendWhatsApp(instanceName, phone,
          `❓ Não entendi. Digite *1*, *2* ou *3* para escolher uma opção.\n\nOu digite *menu* para ver as opções novamente 😊`
        );
      }
      return NextResponse.json({ ok: true });
    }

    // ── AGUARDANDO ESCOLHA DO SERVIÇO ──
    if (step === "aguardando_servico") {
      if (text === "0") {
        await sendWhatsApp(instanceName, phone,
          `1️⃣ Agendar um serviço\n2️⃣ Ver meus agendamentos\n3️⃣ Falar com atendente\n\n_Digite o número da opção_ 👇`
        );
        await (prisma as any).conversationState.update({
          where: { id: state.id },
          data: { step: "aguardando_menu", data: {}, updatedAt: new Date() },
        });
        return NextResponse.json({ ok: true });
      }

      const services = user.services || [];
      const idx = parseInt(text) - 1;
      if (isNaN(idx) || idx < 0 || idx >= services.length) {
        await sendWhatsApp(instanceName, phone,
          `❓ Opção inválida. Digite o número do serviço desejado ou *0* para voltar.`
        );
        return NextResponse.json({ ok: true });
      }

      const selectedService = services[idx];
      await sendWhatsApp(instanceName, phone,
        `✅ *${selectedService.name}* selecionado!\n\n` +
        `📅 Qual data você prefere?\n\n` +
        `_Digite no formato DD/MM (ex: 15/04)_`
      );
      await (prisma as any).conversationState.update({
        where: { id: state.id },
        data: {
          step: "aguardando_data",
          data: { serviceId: selectedService.id, serviceName: selectedService.name },
          updatedAt: new Date(),
        },
      });
      return NextResponse.json({ ok: true });
    }

    // ── AGUARDANDO DATA ──
    if (step === "aguardando_data") {
      if (text === "0") {
        await (prisma as any).conversationState.update({
          where: { id: state.id },
          data: { step: "aguardando_menu", data: {}, updatedAt: new Date() },
        });
        return NextResponse.json({ ok: true });
      }

      const date = formatDate(message.trim());
      if (!date || date < new Date()) {
        await sendWhatsApp(instanceName, phone,
          `❌ Data inválida ou passada. Digite uma data futura no formato *DD/MM* (ex: 20/04)`
        );
        return NextResponse.json({ ok: true });
      }

      await sendWhatsApp(instanceName, phone,
        `⏰ Qual horário você prefere?\n\n_Digite no formato HH:MM (ex: 14:00)_`
      );
      await (prisma as any).conversationState.update({
        where: { id: state.id },
        data: {
          step: "aguardando_horario",
          data: { ...data, date: date.toISOString() },
          updatedAt: new Date(),
        },
      });
      return NextResponse.json({ ok: true });
    }

    // ── AGUARDANDO HORÁRIO ──
    if (step === "aguardando_horario") {
      if (text === "0") {
        await (prisma as any).conversationState.update({
          where: { id: state.id },
          data: { step: "aguardando_data", updatedAt: new Date() },
        });
        return NextResponse.json({ ok: true });
      }

      const time = formatTime(message.trim());
      if (!time) {
        await sendWhatsApp(instanceName, phone,
          `❌ Horário inválido. Digite no formato *HH:MM* (ex: 14:00)`
        );
        return NextResponse.json({ ok: true });
      }

      const appointmentDate = new Date(data.date);
      appointmentDate.setHours(time.hour, time.minute, 0, 0);

      await sendWhatsApp(instanceName, phone,
        `📋 *Confirme seu agendamento:*\n\n` +
        `✨ *Serviço:* ${data.serviceName}\n` +
        `📅 *Data:* ${appointmentDate.toLocaleDateString("pt-BR")}\n` +
        `⏰ *Horário:* ${appointmentDate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}\n\n` +
        `Digite *SIM* para confirmar ou *NÃO* para cancelar 👇`
      );
      await (prisma as any).conversationState.update({
        where: { id: state.id },
        data: {
          step: "aguardando_confirmacao",
          data: { ...data, appointmentDate: appointmentDate.toISOString() },
          updatedAt: new Date(),
        },
      });
      return NextResponse.json({ ok: true });
    }

    // ── AGUARDANDO NOME DO CLIENTE ──
    if (step === "aguardando_nome") {
      const clientName = message.trim();
      await sendWhatsApp(instanceName, phone,
        `🚗 Qual é a placa ou modelo do seu veículo?\n\n_Ex: Honda Civic ou ABC-1234_`
      );
      await (prisma as any).conversationState.update({
        where: { id: state.id },
        data: {
          step: "aguardando_veiculo",
          data: { ...data, clientName },
          updatedAt: new Date(),
        },
      });
      return NextResponse.json({ ok: true });
    }

    // ── AGUARDANDO VEÍCULO ──
    if (step === "aguardando_veiculo") {
      const vehicleInfo = message.trim();
      await sendWhatsApp(instanceName, phone,
        `📋 *Confirme seu agendamento:*\n\n` +
        `👤 *Nome:* ${data.clientName}\n` +
        `🚗 *Veículo:* ${vehicleInfo}\n` +
        `✨ *Serviço:* ${data.serviceName}\n` +
        `📅 *Data:* ${new Date(data.appointmentDate).toLocaleDateString("pt-BR")}\n` +
        `⏰ *Horário:* ${new Date(data.appointmentDate).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}\n\n` +
        `Digite *SIM* para confirmar ou *NÃO* para cancelar 👇`
      );
      await (prisma as any).conversationState.update({
        where: { id: state.id },
        data: {
          step: "aguardando_confirmacao_final",
          data: { ...data, vehicleInfo },
          updatedAt: new Date(),
        },
      });
      return NextResponse.json({ ok: true });
    }

    // ── AGUARDANDO CONFIRMAÇÃO ──
    if (step === "aguardando_confirmacao") {
      if (text === "sim" || text === "s" || text === "yes") {
        // Busca ou cria cliente pelo telefone
        let client = await (prisma as any).client.findFirst({
          where: { userId: user.id, phone: { contains: phone } },
          include: { vehicles: true },
        });

        if (!client) {
          // Pede nome do cliente
          await sendWhatsApp(instanceName, phone,
            `👤 Qual é o seu nome completo?`
          );
          await (prisma as any).conversationState.update({
            where: { id: state.id },
            data: { step: "aguardando_nome", updatedAt: new Date() },
          });
          return NextResponse.json({ ok: true });
        }

        // Cliente existe — busca veículo
        const vehicles = client.vehicles || [];
        if (vehicles.length === 0) {
          await sendWhatsApp(instanceName, phone,
            `🚗 Qual é a placa ou modelo do seu veículo?\n\n_Ex: Honda Civic ou ABC-1234_`
          );
          await (prisma as any).conversationState.update({
            where: { id: state.id },
            data: { step: "aguardando_veiculo", data: { ...data, clientName: client.name }, updatedAt: new Date() },
          });
          return NextResponse.json({ ok: true });
        }

        // Cria agendamento
        const appointment = await (prisma as any).appointment.create({
          data: {
            userId: user.id,
            clientId: client.id,
            vehicleId: vehicles[0].id,
            serviceId: data.serviceId,
            date: new Date(data.appointmentDate),
            status: "pending",
            notes: "Agendado via WhatsApp",
          },
        });

        await sendWhatsApp(instanceName, phone,
          `🎉 *Agendamento confirmado!*\n\n` +
          `✨ *Serviço:* ${data.serviceName}\n` +
          `📅 *Data:* ${new Date(data.appointmentDate).toLocaleDateString("pt-BR")}\n` +
          `⏰ *Horário:* ${new Date(data.appointmentDate).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}\n\n` +
          `Te esperamos! 🚗😊\n\n` +
          `_Digite *menu* para ver outras opções_`
        );

        // Notifica o dono da estética
        if (user.phone) {
          await sendWhatsApp(instanceName, user.phone,
            `🔔 *Novo agendamento via WhatsApp!*\n\n` +
            `👤 *Cliente:* ${client.name}\n` +
            `📱 *Telefone:* ${phone}\n` +
            `✨ *Serviço:* ${data.serviceName}\n` +
            `📅 *Data:* ${new Date(data.appointmentDate).toLocaleDateString("pt-BR")}\n` +
            `⏰ *Horário:* ${new Date(data.appointmentDate).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`
          );
        }

        await (prisma as any).conversationState.update({
          where: { id: state.id },
          data: { step: "menu", data: {}, updatedAt: new Date() },
        });

      } else if (text === "não" || text === "nao" || text === "n") {
        await sendWhatsApp(instanceName, phone,
          `❌ Agendamento cancelado.\n\nDigite *menu* para recomeçar 😊`
        );
        await (prisma as any).conversationState.update({
          where: { id: state.id },
          data: { step: "menu", data: {}, updatedAt: new Date() },
        });
      } else {
        await sendWhatsApp(instanceName, phone,
          `❓ Digite *SIM* para confirmar ou *NÃO* para cancelar.`
        );
      }
      return NextResponse.json({ ok: true });
    }

    // ── CONFIRMAÇÃO FINAL (novo cliente) ──
    if (step === "aguardando_confirmacao_final") {
      if (text === "sim" || text === "s") {
        // Cria cliente e veículo
        const vehicleParts = data.vehicleInfo.split(" ");
        const newClient = await (prisma as any).client.create({
          data: {
            userId: user.id,
            name: data.clientName,
            phone: phone,
          },
        });

        const newVehicle = await (prisma as any).vehicle.create({
          data: {
            clientId: newClient.id,
            brand: vehicleParts[0] || "Não informado",
            model: vehicleParts.slice(1).join(" ") || data.vehicleInfo,
            plate: data.vehicleInfo.match(/[A-Z]{3}-?\d{4}/i)?.[0] || null,
          },
        });

        await (prisma as any).appointment.create({
          data: {
            userId: user.id,
            clientId: newClient.id,
            vehicleId: newVehicle.id,
            serviceId: data.serviceId,
            date: new Date(data.appointmentDate),
            status: "pending",
            notes: "Agendado via WhatsApp",
          },
        });

        await sendWhatsApp(instanceName, phone,
          `🎉 *Agendamento confirmado!*\n\n` +
          `✨ *Serviço:* ${data.serviceName}\n` +
          `📅 *Data:* ${new Date(data.appointmentDate).toLocaleDateString("pt-BR")}\n` +
          `⏰ *Horário:* ${new Date(data.appointmentDate).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}\n\n` +
          `Te esperamos! 🚗😊`
        );

        // Notifica o dono
        if (user.phone) {
          await sendWhatsApp(instanceName, user.phone,
            `🔔 *Novo agendamento via WhatsApp!*\n\n` +
            `👤 *Cliente:* ${data.clientName} (novo)\n` +
            `📱 *Telefone:* ${phone}\n` +
            `🚗 *Veículo:* ${data.vehicleInfo}\n` +
            `✨ *Serviço:* ${data.serviceName}\n` +
            `📅 *Data:* ${new Date(data.appointmentDate).toLocaleDateString("pt-BR")}\n` +
            `⏰ *Horário:* ${new Date(data.appointmentDate).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`
          );
        }

        await (prisma as any).conversationState.update({
          where: { id: state.id },
          data: { step: "menu", data: {}, updatedAt: new Date() },
        });

      } else {
        await sendWhatsApp(instanceName, phone,
          `❌ Agendamento cancelado.\n\nDigite *menu* para recomeçar 😊`
        );
        await (prisma as any).conversationState.update({
          where: { id: state.id },
          data: { step: "menu", data: {}, updatedAt: new Date() },
        });
      }
      return NextResponse.json({ ok: true });
    }

    // Fallback
    await sendWhatsApp(instanceName, phone,
      `😊 Digite *menu* para ver as opções disponíveis!`
    );
    await (prisma as any).conversationState.update({
      where: { id: state.id },
      data: { step: "menu", data: {}, updatedAt: new Date() },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("ERRO WHATSAPP WEBHOOK:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}