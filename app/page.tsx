"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const faqData = [
  { q: "Não entendo de tecnologia. Vou conseguir usar?", a: "Sim! O EstéticaPro foi criado pensando em donos de estética, não em programadores. A interface é simples, intuitiva e você começa a usar em minutos." },
  { q: "Funciona em qualquer dispositivo?", a: "Sim! O EstéticaPro funciona no celular, tablet e computador — basta ter acesso à internet. Nenhum aplicativo para instalar." },
  { q: "Posso cancelar quando quiser?", a: "Sim. O plano mensal pode ser cancelado a qualquer momento, sem multa e sem burocracia. Você tem controle total." },
  { q: "Como funciona a confirmação pelo WhatsApp?", a: "Ao criar um agendamento, você envia a confirmação direto pelo WhatsApp do cliente com um clique. O sistema monta a mensagem automaticamente." },
  { q: "Posso cadastrar vários veículos por cliente?", a: "Sim! Cada cliente pode ter quantos veículos quiser cadastrados. Assim você tem o histórico completo de cada carro." },
  { q: "É seguro? Meus dados ficam protegidos?", a: "Totalmente seguro. Seus dados ficam em servidores protegidos com criptografia. Nenhuma informação sua é compartilhada com terceiros." },
  { q: "Tem limite de agendamentos?", a: "No plano Anual os agendamentos e clientes são ilimitados. No plano Mensal você pode cadastrar até 100 agendamentos por mês." },
  { q: "Posso testar antes de assinar?", a: "Sim! Entre em contato pelo WhatsApp e nossa equipe faz uma demonstração ao vivo com você, mostrando tudo que o sistema faz pelo seu negócio." },
];

export default function LandingPage() {
  const [timeLeft, setTimeLeft] = useState({ h: 2, m: 0, s: 0 });
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatStep, setChatStep] = useState(0);

  const whatsappLink = "https://wa.me/5511999999999?text=Olá,%20quero%20conhecer%20o%20EstéticaPro!";

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const total = prev.h * 3600 + prev.m * 60 + prev.s - 1;
        if (total <= 0) return { h: 0, m: 0, s: 0 };
        return { h: Math.floor(total / 3600), m: Math.floor((total % 3600) / 60), s: total % 60 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setChatOpen(true), 8000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!chatOpen || chatStep >= 2) return;
    const t = setTimeout(() => setChatStep((s) => s + 1), 1200);
    return () => clearTimeout(t);
  }, [chatOpen, chatStep]);

  const pad = (n: number) => String(n).padStart(2, "0");

  const scrollToPrecos = () => {
    document.getElementById("precos")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        :root {
          --primary: #4F8EF7;
          --primary-dark: #2563EB;
          --primary-light: #EEF2FB;
          --dark: #1E293B;
          --white: #FFFFFF;
          --cream: #F8FAFC;
          --gray: #64748B;
          --light: #E2E8F0;
          --green: #16A34A;
          --wpp: #25D366;
          --wpp-dark: #128C7E;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'DM Sans', sans-serif; background: var(--white); color: var(--dark); overflow-x: hidden; }
        .urgency-bar { background: var(--primary); color: #fff; font-size: 12px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; padding: 10px 0; overflow: hidden; white-space: nowrap; }
        .urgency-track { display: inline-flex; gap: 60px; animation: ticker 18s linear infinite; }
        @keyframes ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        nav { position: sticky; top: 0; z-index: 100; background: #1E293B; border-bottom: 1px solid rgba(255,255,255,0.08); padding: 16px 48px; display: flex; align-items: center; justify-content: space-between; }
        .logo { display: flex; align-items: center; gap: 10px; }
        .logo-text { font-family: 'Playfair Display', serif; font-size: 22px; color: var(--dark); font-weight: 700; }
        .logo-text span { color: var(--primary); }
        .nav-btn { border: 1.5px solid #fff; background: transparent; padding: 8px 24px; border-radius: 6px; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 600; cursor: pointer; color: #fff; transition: all 0.2s; text-decoration: none; display: inline-block; }
        .nav-btn:hover { background: #fff; color: #1E293B; }
        .hero { background: var(--dark); padding: 100px 48px 80px; position: relative; overflow: hidden; min-height: 85vh; display: flex; align-items: center; }
        .hero::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse 70% 60% at 65% 50%, rgba(79,142,247,0.15) 0%, transparent 70%); }
        .hero-content { position: relative; z-index: 2; max-width: 600px; }
        .hero-badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(79,142,247,0.15); border: 1px solid rgba(79,142,247,0.4); color: #93C5FD; padding: 6px 16px; border-radius: 100px; font-size: 12px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 32px; }
        .hero h1 { font-family: 'Playfair Display', serif; font-size: clamp(42px, 5vw, 64px); line-height: 1.1; color: var(--white); margin-bottom: 24px; }
        .hero h1 em { color: #93C5FD; font-style: normal; }
        .hero p { font-size: 18px; line-height: 1.7; color: rgba(255,255,255,0.65); margin-bottom: 48px; max-width: 480px; }
        .hero-cta { display: flex; flex-direction: column; align-items: flex-start; gap: 12px; }
        .btn-primary { background: var(--primary); color: #fff; border: none; padding: 18px 48px; border-radius: 8px; font-family: 'DM Sans', sans-serif; font-size: 16px; font-weight: 700; letter-spacing: 0.5px; cursor: pointer; box-shadow: 0 8px 32px rgba(79,142,247,0.4); text-decoration: none; display: inline-block; transition: background 0.2s; }
        .btn-primary:hover { background: var(--primary-dark); }
        .cta-note { font-size: 13px; color: rgba(250,250,248,0.45); }
        .hero-mockup { position: absolute; right: -20px; top: 50%; transform: translateY(-50%); width: 520px; background: #1E293B; border-radius: 16px; border: 1px solid rgba(255,255,255,0.08); overflow: hidden; box-shadow: -40px 0 80px rgba(0,0,0,0.5); }
        .mockup-bar { background: #0F172A; padding: 12px 16px; display: flex; align-items: center; gap: 8px; }
        .mockup-dot { width: 10px; height: 10px; border-radius: 50%; }
        .mockup-url { flex: 1; background: #1E293B; border-radius: 4px; padding: 4px 12px; font-size: 11px; color: #64748B; margin: 0 8px; font-family: monospace; }
        .mockup-body { padding: 20px; }
        .mockup-header { color: var(--primary); font-size: 13px; font-weight: 600; margin-bottom: 16px; }
        .mockup-cards { display: grid; grid-template-columns: repeat(3,1fr); gap: 8px; margin-bottom: 16px; }
        .mockup-card { border-radius: 8px; padding: 10px 8px; text-align: center; }
        .mc-blue { background: rgba(79,142,247,0.15); border: 1px solid rgba(79,142,247,0.3); }
        .mc-green { background: rgba(22,163,74,0.15); border: 1px solid rgba(22,163,74,0.3); }
        .mc-orange { background: rgba(234,88,12,0.15); border: 1px solid rgba(234,88,12,0.3); }
        .mc-icon { font-size: 18px; margin-bottom: 4px; }
        .mc-label { font-size: 9px; color: #94A3B8; }
        .mc-val { font-size: 18px; font-weight: 700; }
        .mockup-table { width: 100%; border-collapse: collapse; font-size: 10px; }
        .mockup-table th { color: #64748B; font-weight: 500; padding: 4px 6px; text-align: left; border-bottom: 1px solid #334155; }
        .mockup-table td { color: #CBD5E1; padding: 6px 6px; border-bottom: 1px solid #1E293B; }
        .tag-green { background: rgba(22,163,74,0.2); color: #4ade80; padding: 2px 6px; border-radius: 4px; font-size: 9px; }
        .tag-orange { background: rgba(234,88,12,0.2); color: #fb923c; padding: 2px 6px; border-radius: 4px; font-size: 9px; }
        .section-tag { display: inline-block; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: var(--primary); margin-bottom: 12px; }
        .section-header { text-align: center; margin-bottom: 60px; }
        .section-header h2 { font-family: 'Playfair Display', serif; font-size: clamp(32px, 4vw, 48px); color: var(--dark); margin-bottom: 16px; }
        .section-header p { font-size: 17px; color: var(--gray); max-width: 540px; margin: 0 auto; line-height: 1.7; }
        .como-funciona { padding: 100px 48px; background: var(--white); }
        .como-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: center; max-width: 1000px; margin: 0 auto; }
        .como-text p { font-size: 17px; color: var(--gray); line-height: 1.8; margin-bottom: 20px; }
        .como-text strong { color: var(--dark); }
        .devices-mock { background: var(--cream); border-radius: 16px; padding: 32px; display: flex; flex-direction: column; align-items: center; gap: 12px; border: 1px solid var(--light); }
        .device-laptop { width: 100%; background: var(--dark); border-radius: 8px; padding: 12px; border: 2px solid #334155; }
        .device-row { display: flex; gap: 12px; width: 100%; }
        .device-phone { width: 80px; background: var(--dark); border-radius: 12px; padding: 8px; border: 2px solid #334155; flex-shrink: 0; }
        .device-tablet { flex: 1; background: var(--dark); border-radius: 8px; padding: 8px; border: 2px solid #334155; }
        .device-screen { background: #0F172A; border-radius: 4px; padding: 6px; min-height: 60px; }
        .ds-title { font-size: 7px; color: var(--primary); font-weight: 600; margin-bottom: 4px; }
        .ds-bar { height: 3px; border-radius: 2px; margin-bottom: 3px; }
        .ds-gold { background: var(--primary); width: 70%; }
        .ds-gray { background: #334155; width: 90%; }
        .ds-sm { background: #334155; width: 50%; }
        .funcionalidades { padding: 100px 48px; background: var(--cream); }
        .feat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; max-width: 1100px; margin: 0 auto; }
        .feat-card { background: var(--white); border-radius: 16px; padding: 32px 28px; border: 1px solid var(--light); transition: transform 0.2s, box-shadow 0.2s; }
        .feat-card:hover { transform: translateY(-4px); box-shadow: 0 16px 48px rgba(79,142,247,0.12); }
        .feat-icon { width: 48px; height: 48px; background: var(--primary-light); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 22px; margin-bottom: 20px; }
        .feat-card h3 { font-size: 17px; font-weight: 700; color: var(--dark); margin-bottom: 12px; }
        .feat-card p { font-size: 14px; color: var(--gray); line-height: 1.7; }
        .pra-quem { padding: 100px 48px; background: var(--dark); }
        .pra-quem .section-header h2 { color: var(--white); }
        .pra-quem .section-header p { color: rgba(255,255,255,0.5); }
        .pra-quem .section-tag { color: #93C5FD; }
        .pq-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; max-width: 1100px; margin: 0 auto; }
        .pq-card { background: rgba(79,142,247,0.08); border: 1px solid rgba(79,142,247,0.2); border-radius: 16px; padding: 28px 20px; text-align: center; }
        .pq-icon { font-size: 32px; margin-bottom: 12px; }
        .pq-card h3 { font-size: 14px; font-weight: 700; color: var(--white); margin-bottom: 8px; }
        .pq-card p { font-size: 12px; color: rgba(255,255,255,0.45); line-height: 1.6; }
        .depoimentos { padding: 100px 48px; background: var(--cream); }
        .dep-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; max-width: 1100px; margin: 0 auto; }
        .dep-card { background: var(--white); border-radius: 16px; padding: 28px; border: 1px solid var(--light); }
        .dep-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
        .dep-avatar { width: 44px; height: 44px; border-radius: 50%; background: var(--primary-light); display: flex; align-items: center; justify-content: center; font-size: 18px; }
        .dep-name { font-weight: 700; font-size: 14px; color: var(--dark); }
        .dep-biz { font-size: 12px; color: var(--gray); }
        .wpp-badge { display: inline-flex; align-items: center; gap: 4px; background: #dcfce7; color: #16a34a; font-size: 10px; font-weight: 600; padding: 3px 8px; border-radius: 4px; margin-top: 8px; }
        .urgencia { padding: 60px 48px; background: linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%); border-top: 2px solid #BFDBFE; border-bottom: 2px solid #BFDBFE; text-align: center; }
        .urg-box { max-width: 560px; margin: 0 auto; background: var(--white); border-radius: 16px; padding: 40px; border: 1.5px solid #BFDBFE; box-shadow: 0 8px 32px rgba(79,142,247,0.12); }
        .urg-title { font-size: 22px; font-weight: 800; color: var(--primary-dark); margin-bottom: 8px; }
        .urg-sub { font-size: 15px; color: var(--gray); margin-bottom: 16px; }
        .countdown { font-family: 'Playfair Display', serif; font-size: 40px; font-weight: 900; color: var(--primary); letter-spacing: 2px; margin-bottom: 12px; }
        .urg-note { font-size: 12px; color: #aaa; }
        .precos { padding: 100px 48px; background: var(--white); }
        .price-grid { display: grid; grid-template-columns: 1fr 1.15fr; gap: 24px; max-width: 760px; margin: 0 auto; align-items: start; }
        .price-card { border-radius: 20px; padding: 36px 28px; border: 1.5px solid var(--light); position: relative; }
        .price-card.featured { background: linear-gradient(160deg, #EFF6FF 0%, #DBEAFE 100%); border-color: var(--primary); box-shadow: 0 24px 64px rgba(79,142,247,0.2); transform: translateY(-8px); }
        .price-badge { position: absolute; top: -14px; left: 50%; transform: translateX(-50%); background: var(--primary); color: #fff; padding: 6px 20px; border-radius: 100px; font-size: 11px; font-weight: 700; letter-spacing: 1px; white-space: nowrap; }
        .price-tag { font-size: 12px; color: var(--gray); margin-bottom: 8px; text-align: center; }
        .price-name { font-family: 'Playfair Display', serif; font-size: 28px; text-align: center; margin-bottom: 8px; color: var(--dark); }
        .price-save { background: #DBEAFE; color: var(--primary-dark); font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 100px; text-align: center; margin-bottom: 12px; }
        .price-old { text-align: center; font-size: 13px; color: #aaa; text-decoration: line-through; margin-bottom: 4px; }
        .price-val { text-align: center; margin-bottom: 4px; }
        .price-val strong { font-size: 44px; font-weight: 800; color: var(--primary); font-family: 'Playfair Display', serif; }
        .price-val span { font-size: 15px; color: var(--gray); }
        .price-period { text-align: center; font-size: 12px; color: var(--gray); margin-bottom: 24px; }
        .price-divider { border: none; border-top: 1px solid var(--light); margin: 20px 0; }
        .price-feat { font-size: 12px; font-weight: 700; color: var(--dark); margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px; }
        .price-item { display: flex; align-items: flex-start; gap: 8px; font-size: 13px; color: var(--gray); margin-bottom: 8px; line-height: 1.5; }
        .pi-check { color: var(--primary); flex-shrink: 0; margin-top: 1px; }
        .price-btn { width: 100%; padding: 14px; border-radius: 10px; font-size: 15px; font-weight: 700; cursor: pointer; margin-top: 24px; border: none; font-family: 'DM Sans', sans-serif; }
        .price-btn.secondary { background: var(--white); border: 1.5px solid var(--light); color: var(--dark); }
        .price-btn.primary-btn { background: var(--primary); color: #fff; box-shadow: 0 8px 24px rgba(79,142,247,0.3); }
        .price-btn.primary-btn:hover { background: var(--primary-dark); }
        .price-secure { text-align: center; font-size: 11px; color: #aaa; margin-top: 10px; }
        .faq { padding: 100px 48px; background: var(--cream); }
        .faq-inner { max-width: 720px; margin: 0 auto; }
        .faq-trigger { width: 100%; background: none; border: none; padding: 20px 24px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; text-align: left; font-family: 'DM Sans', sans-serif; }
        .faq-q { font-size: 15px; font-weight: 600; color: var(--dark); flex: 1; padding-right: 16px; }
        .faq-icon { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; transition: background 0.2s, transform 0.3s; user-select: none; }
        .faq-answer { font-size: 14px; color: var(--gray); line-height: 1.75; border-top: 1px solid var(--light); padding: 16px 24px 20px; margin: 0; }
        .wpp-float { position: fixed; bottom: 28px; right: 28px; z-index: 9999; display: flex; flex-direction: column; align-items: flex-end; gap: 12px; }
        .wpp-bubble { background: #fff; border-radius: 16px 16px 0 16px; box-shadow: 0 8px 32px rgba(0,0,0,0.15); width: 300px; overflow: hidden; transform-origin: bottom right; transition: opacity 0.3s, transform 0.3s; opacity: 0; transform: scale(0.85) translateY(10px); pointer-events: none; }
        .wpp-bubble.visible { opacity: 1; transform: scale(1) translateY(0); pointer-events: all; }
        .wpp-header { background: var(--wpp-dark); padding: 12px 16px; display: flex; align-items: center; gap: 10px; }
        .wpp-avatar { width: 36px; height: 36px; border-radius: 50%; overflow: hidden; flex-shrink: 0; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; font-size: 18px; }
        .wpp-header-name { font-size: 13px; font-weight: 700; color: #fff; }
        .wpp-header-status { font-size: 11px; color: rgba(255,255,255,0.7); }
        .wpp-close { background: none; border: none; color: rgba(255,255,255,0.7); cursor: pointer; font-size: 18px; padding: 2px 4px; line-height: 1; margin-left: auto; }
        .wpp-messages { background: #ECE5DD; padding: 16px; min-height: 120px; display: flex; flex-direction: column; gap: 8px; }
        .wpp-msg { background: #fff; border-radius: 8px 8px 8px 0; padding: 10px 12px; font-size: 13px; color: #1a1a1a; line-height: 1.5; max-width: 85%; box-shadow: 0 1px 2px rgba(0,0,0,0.1); opacity: 0; transform: translateY(6px); transition: opacity 0.4s, transform 0.4s; }
        .wpp-msg.show { opacity: 1; transform: translateY(0); }
        .wpp-msg-time { font-size: 10px; color: #999; text-align: right; margin-top: 4px; }
        .wpp-typing { display: flex; align-items: center; gap: 4px; padding: 10px 14px; background: #fff; border-radius: 8px 8px 8px 0; width: fit-content; box-shadow: 0 1px 2px rgba(0,0,0,0.1); opacity: 0; transition: opacity 0.3s; }
        .wpp-typing.show { opacity: 1; }
        .wpp-typing span { width: 7px; height: 7px; background: #aaa; border-radius: 50%; animation: typing-dot 1.2s infinite ease-in-out; }
        .wpp-typing span:nth-child(2) { animation-delay: 0.2s; }
        .wpp-typing span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes typing-dot { 0%, 80%, 100% { transform: scale(0.7); opacity: 0.5; } 40% { transform: scale(1); opacity: 1; } }
        .wpp-cta-btn { display: block; background: var(--wpp); color: #fff; text-align: center; padding: 14px; font-size: 14px; font-weight: 700; text-decoration: none; font-family: 'DM Sans', sans-serif; transition: background 0.2s; }
        .wpp-cta-btn:hover { background: var(--wpp-dark); }
        .wpp-fab { width: 56px; height: 56px; border-radius: 50%; background: var(--wpp); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 20px rgba(37,211,102,0.5); transition: transform 0.2s, background 0.2s; position: relative; }
        .wpp-fab:hover { transform: scale(1.08); background: var(--wpp-dark); }
        .wpp-fab svg { width: 28px; height: 28px; fill: #fff; }
        .wpp-notify { position: absolute; top: -4px; right: -4px; width: 18px; height: 18px; background: #ef4444; border-radius: 50%; font-size: 10px; font-weight: 700; color: #fff; display: flex; align-items: center; justify-content: center; animation: pulse-dot 2s infinite; }
        @keyframes pulse-dot { 0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.4); } 50% { box-shadow: 0 0 0 6px rgba(239,68,68,0); } }
        .cta-final { padding: 100px 48px; background: var(--dark); text-align: center; position: relative; overflow: hidden; }
        .cta-final::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse 60% 50% at 50% 50%, rgba(79,142,247,0.12) 0%, transparent 70%); }
        .cta-final-inner { position: relative; z-index: 2; max-width: 640px; margin: 0 auto; }
        .cta-final h2 { font-family: 'Playfair Display', serif; font-size: clamp(32px, 4vw, 52px); color: var(--white); margin-bottom: 20px; line-height: 1.2; }
        .cta-final h2 em { color: #93C5FD; font-style: normal; }
        .cta-final p { font-size: 17px; color: rgba(255,255,255,0.55); margin-bottom: 40px; line-height: 1.7; }
        .cta-pills { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; margin-bottom: 40px; }
        .cta-pill { background: rgba(79,142,247,0.1); border: 1px solid rgba(79,142,247,0.3); color: rgba(255,255,255,0.7); padding: 8px 16px; border-radius: 100px; font-size: 13px; }
        .cta-seals { display: flex; justify-content: center; gap: 32px; margin-top: 24px; }
        .cta-seal { font-size: 13px; color: rgba(255,255,255,0.35); display: flex; align-items: center; gap: 6px; }
        footer { background: #0F172A; padding: 24px 48px; display: flex; align-items: center; justify-content: space-between; border-top: 1px solid rgba(255,255,255,0.06); }
        footer p { font-size: 12px; color: #475569; }
        .footer-links { display: flex; gap: 24px; }
        .footer-links a { font-size: 12px; color: #475569; text-decoration: none; }
        .footer-links a:hover { color: var(--primary); }
        @media (max-width: 900px) {
          nav { padding: 16px 20px; }
          .hero { padding: 60px 20px; min-height: auto; }
          .hero-mockup { display: none; }
          .como-grid, .feat-grid, .dep-grid { grid-template-columns: 1fr; }
          .pq-grid { grid-template-columns: repeat(2, 1fr); }
          .price-grid { grid-template-columns: 1fr !important; }
          .price-card.featured { transform: none; }
          .como-funciona, .funcionalidades, .pra-quem, .depoimentos, .precos, .faq, .cta-final { padding: 60px 20px; }
          .urgencia { padding: 40px 20px; }
          footer { flex-direction: column; gap: 12px; padding: 20px; text-align: center; }
          .wpp-bubble { width: 270px; }
          .wpp-float { bottom: 16px; right: 16px; }
        }
      `}</style>

      {/* NAVBAR */}
      <nav>
        <div className="logo">
          <img src="/logo.png" alt="EstéticaPro" style={{height:80, objectFit:"contain"}} />
        </div>
        <Link href="/login" className="nav-btn">Entrar</Link>
      </nav>

      {/* URGENCY BAR */}
      <div className="urgency-bar">
        <div className="urgency-track">
          <span>🚗 OFERTA POR TEMPO LIMITADO</span><span>· GARANTA SEU ACESSO ·</span>
          <span>🚗 DESCONTO ENCERRA EM BREVE</span><span>· GARANTA SEU ACESSO ·</span>
          <span>🚗 OFERTA POR TEMPO LIMITADO</span><span>· GARANTA SEU ACESSO ·</span>
          <span>🚗 DESCONTO ENCERRA EM BREVE</span><span>· GARANTA SEU ACESSO ·</span>
        </div>
      </div>

      {/* HERO */}
      <div className="hero">
        <div className="hero-content">
          <div className="hero-badge">🚗 sistema para estéticas automotivas</div>
          <h1>Pare de perder agendamentos e comece a <em>crescer de verdade</em></h1>
          <p>O sistema que organiza sua agenda, controla seus clientes e confirma agendamentos pelo WhatsApp — tudo pelo celular, simples e 100% online.</p>
          <div className="hero-cta">
            <button className="btn-primary" onClick={scrollToPrecos}>COMEÇAR AGORA</button>
            <span className="cta-note">Sem taxas de setup. Plano mensal cancele quando quiser.</span>
          </div>
        </div>
        <div className="hero-mockup">
          <div className="mockup-bar">
            <div className="mockup-dot" style={{background:"#FF5F57"}}></div>
            <div className="mockup-dot" style={{background:"#FFBD2E"}}></div>
            <div className="mockup-dot" style={{background:"#28C840"}}></div>
            <div className="mockup-url">esteticapro.com.br/dashboard</div>
          </div>
          <div className="mockup-body">
            <div className="mockup-header">🚗 EstéticaPro — Hoje, 15 de Abril</div>
            <div className="mockup-cards">
              <div className="mockup-card mc-blue"><div className="mc-icon">📅</div><div className="mc-label">Agendamentos</div><div className="mc-val" style={{color:"#60A5FA"}}>4</div></div>
              <div className="mockup-card mc-green"><div className="mc-icon">✅</div><div className="mc-label">Concluídos</div><div className="mc-val" style={{color:"#4ade80"}}>2</div></div>
              <div className="mockup-card mc-orange"><div className="mc-icon">🕐</div><div className="mc-label">Próximo</div><div className="mc-val" style={{color:"#fb923c"}}>14h</div></div>
            </div>
            <table className="mockup-table">
              <thead><tr><th>Cliente</th><th>Veículo</th><th>Serviço</th><th>Status</th></tr></thead>
              <tbody>
                <tr><td>João Silva</td><td>Gol 2018</td><td>Lavagem</td><td><span className="tag-green">Confirmado</span></td></tr>
                <tr><td>Maria Souza</td><td>Civic 2020</td><td>Polimento</td><td><span className="tag-orange">Pendente</span></td></tr>
                <tr><td>Carlos M.</td><td>Hilux 2021</td><td>Vitrificação</td><td><span className="tag-orange">Pendente</span></td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* COMO FUNCIONA */}
      <section className="como-funciona">
        <div className="section-header">
          <div className="section-tag">Como Funciona</div>
          <h2>Como Funciona o EstéticaPro</h2>
          <p>Da agenda ao WhatsApp, tudo organizado em um só lugar</p>
        </div>
        <div className="como-grid">
          <div className="como-text">
            <p>O EstéticaPro é uma plataforma completa criada para <strong>donos de estéticas automotivas e lava-rápidos</strong> que querem parar de improvisar e começar a gerir o negócio com profissionalismo.</p>
            <p>A plataforma centraliza sua agenda, clientes, veículos e serviços — tudo acessível pelo celular ou computador, em tempo real. Você elimina as anotações no papel, nunca mais esquece um agendamento e confirma tudo pelo WhatsApp com um clique.</p>
          </div>
          <div className="devices-mock">
            <div className="device-laptop"><div className="device-screen"><div className="ds-title">🚗 Dashboard — EstéticaPro</div><div className="ds-bar ds-gold"></div><div className="ds-bar ds-gray"></div><div className="ds-bar ds-sm"></div></div></div>
            <div className="device-row">
              <div className="device-phone"><div className="device-screen" style={{minHeight:"80px"}}><div className="ds-title">Agenda</div><div className="ds-bar ds-gold"></div><div className="ds-bar ds-gray"></div></div></div>
              <div className="device-tablet"><div className="device-screen" style={{minHeight:"80px"}}><div className="ds-title">Clientes</div><div className="ds-bar ds-gold"></div><div className="ds-bar ds-gray"></div><div className="ds-bar ds-sm"></div></div></div>
            </div>
            <p style={{fontSize:"12px",color:"var(--gray)",textAlign:"center"}}>Funciona no celular, tablet e computador</p>
          </div>
        </div>
      </section>

      {/* FUNCIONALIDADES */}
      <section className="funcionalidades">
        <div className="section-header">
          <div className="section-tag">Funcionalidades</div>
          <h2>Tudo que você precisa em um só sistema</h2>
        </div>
        <div className="feat-grid">
          {[
            {icon:"📅", title:"Agenda Completa", text:"Visualize todos os agendamentos do dia, da semana ou do mês. Nunca mais perca um cliente por esquecimento."},
            {icon:"👤", title:"Clientes e Veículos", text:"Cadastre seus clientes com todos os veículos vinculados. Histórico completo de cada carro na palma da mão."},
            {icon:"💬", title:"Confirmação via WhatsApp", text:"Envie confirmação de agendamento direto no WhatsApp do cliente com um clique. Profissional e rápido."},
            {icon:"🚗", title:"Gestão de Serviços", text:"Cadastre seus serviços com preço e duração. O sistema calcula automaticamente o tempo da agenda."},
            {icon:"📊", title:"Dashboard em Tempo Real", text:"Veja quantos agendamentos tem hoje, o próximo horário e quantos veículos estão em serviço agora."},
            {icon:"📱", title:"100% Mobile", text:"Funciona perfeitamente no celular. Gerencie sua estética de qualquer lugar, sem precisar de computador."},
          ].map((f, i) => (
            <div key={i} className="feat-card">
              <div className="feat-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRA QUEM */}
      <section className="pra-quem">
        <div className="section-header">
          <div className="section-tag">Pra Quem É</div>
          <h2>🚗 Pra Quem é o EstéticaPro</h2>
          <p>Se você trabalha com estética automotiva, esse sistema é pra você</p>
        </div>
        <div className="pq-grid">
          {[
            {icon:"✨", title:"Estéticas Automotivas", text:"Controle total da operação — agenda, clientes e serviços em um só lugar"},
            {icon:"🚿", title:"Lava-Rápidos", text:"Gerencie filas e agendamentos sem papel e sem confusão"},
            {icon:"🔧", title:"Polimento e Vitrificação", text:"Controle serviços premium com histórico completo por veículo"},
            {icon:"🏪", title:"Centros Automotivos", text:"Múltiplos serviços e clientes organizados de forma profissional"},
          ].map((p, i) => (
            <div key={i} className="pq-card">
              <div className="pq-icon">{p.icon}</div>
              <h3>{p.title}</h3>
              <p>{p.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* DEPOIMENTOS */}
      <section className="depoimentos">
        <div className="section-header">
          <div className="section-tag">Clientes</div>
          <h2>⭐ O Que Nossos Clientes Dizem</h2>
          <p>Estéticas que transformaram sua gestão com o EstéticaPro</p>
        </div>
        <div className="dep-grid">
          {[
            {name:"Ricardo Oliveira", biz:"Auto Estética Premium — São Paulo/SP", stars:"⭐⭐⭐⭐⭐", text:"Antes eu anotava tudo no caderno e sempre esquecia algum agendamento. Com o EstéticaPro tudo ficou organizado e os clientes adoram receber a confirmação pelo WhatsApp."},
            {name:"Fernanda Costa", biz:"Lava Car Express — Campinas/SP", stars:"⭐⭐⭐⭐⭐", text:"O sistema é muito fácil de usar. Em menos de 30 minutos já tinha cadastrado todos os meus clientes e veículos. Recomendo para qualquer estética."},
            {name:"Paulo Henrique", biz:"Top Polimentos — Ribeirão Preto/SP", stars:"⭐⭐⭐⭐⭐", text:"Finalmente consigo ver no dashboard quantos carros tenho para atender hoje. O botão de WhatsApp economiza muito tempo na confirmação dos agendamentos."},
          ].map((d, i) => (
            <div key={i} className="dep-card">
              <div className="dep-header">
                <div className="dep-avatar">🚗</div>
                <div><div className="dep-name">{d.name}</div><div className="dep-biz">{d.biz}</div></div>
              </div>
              <div style={{marginBottom:12}}>{d.stars}</div>
              <p style={{fontSize:14, color:"var(--gray)", lineHeight:1.7}}>{d.text}</p>
              <div className="wpp-badge" style={{marginTop:16}}>✓ Via WhatsApp</div>
            </div>
          ))}
        </div>
      </section>

      {/* URGÊNCIA */}
      <section className="urgencia">
        <div className="urg-box">
          <div className="urg-title">🚨 ENCERRA HOJE!</div>
          <div className="urg-sub">A promoção encerra em breve</div>
          <div className="countdown">{pad(timeLeft.h)}h {pad(timeLeft.m)}m {pad(timeLeft.s)}s</div>
          <div className="urg-note">Condição válida para novos usuários EstéticaPro</div>
        </div>
      </section>

      {/* PREÇOS */}
      <section className="precos" id="precos">
        <div className="section-header">
          <div className="section-tag">Planos</div>
          <h2>💳 Escolha Seu Plano</h2>
          <p style={{color:"var(--primary-dark)",fontWeight:600}}>⚡ Teste grátis por 7 dias — sem cartão necessário</p>
        </div>
        <div className="price-grid">

          {/* MENSAL — TRIAL */}
          <div className="price-card featured">
            <div className="price-badge">🎁 MAIS POPULAR</div>
            <div className="price-tag">Comece sem pagar nada</div>
            <div className="price-name">Mensal</div>
            <div style={{background:"#F0FDF4", border:"1px solid #BBF7D0", color:"#16A34A", fontSize:12, fontWeight:700, padding:"4px 12px", borderRadius:100, textAlign:"center", marginBottom:12}}>🎁 7 dias grátis</div>
            <div className="price-val"><strong>97,90</strong><span>/mês</span></div>
            <div className="price-period">após o período de teste</div>
            <hr className="price-divider" />
            <div className="price-feat">✨ Incluído:</div>
            {["Agenda de serviços","Clientes e veículos ilimitados","Gestão de serviços","Suporte por WhatsApp"].map((f,i) => (
              <div key={i} className="price-item"><span className="pi-check">✓</span>{f}</div>
            ))}
            <Link href="/assinar?plano=mensal">
              <button className="price-btn primary-btn" style={{marginTop:24}}>🎁 Testar 7 dias grátis</button>
            </Link>
            <div className="price-secure">Sem cartão • Cancele quando quiser</div>
          </div>

          {/* PREMIUM */}
          <div className="price-card" style={{background:"linear-gradient(160deg,#1E293B 0%,#0F172A 100%)", border:"1.5px solid #F59E0B", position:"relative"}}>
            <div className="price-badge" style={{background:"linear-gradient(90deg,#F59E0B,#EF4444)"}}>⭐ PREMIUM</div>
            <div className="price-tag" style={{color:"#94A3B8"}}>Para quem quer o máximo</div>
            <div className="price-name" style={{color:"#F59E0B"}}>Premium</div>
            <div style={{background:"rgba(245,158,11,0.15)", border:"1px solid rgba(245,158,11,0.3)", color:"#FCD34D", fontSize:11, fontWeight:700, padding:"4px 12px", borderRadius:100, textAlign:"center", marginBottom:12}}>🚗 WhatsApp integrado</div>
            <div className="price-old" style={{color:"#64748B"}}>De R$ 497,00</div>
            <div className="price-val"><strong style={{color:"#F59E0B"}}>249,90</strong><span style={{color:"#94A3B8"}}>/mês</span></div>
            <div className="price-period" style={{color:"#64748B"}}>Acesso mensal completo</div>
            <hr className="price-divider" style={{borderColor:"#334155"}} />
            <div className="price-feat" style={{color:"#F59E0B"}}>⭐ Tudo do Mensal +</div>
            {["WhatsApp próprio conectado","Envio automático de lembretes","Notificações para clientes","Instância exclusiva Evolution API","Suporte VIP prioritário"].map((f,i) => (
              <div key={i} className="price-item" style={{color:"#CBD5E1"}}><span style={{color:"#F59E0B", flexShrink:0, marginTop:1}}>✓</span>{f}</div>
            ))}
            <Link href="/assinar?plano=premium">
              <button className="price-btn" style={{background:"linear-gradient(90deg,#F59E0B,#EF4444)", color:"#fff", boxShadow:"0 8px 24px rgba(245,158,11,0.3)", marginTop:24, width:"100%", padding:14, borderRadius:10, fontSize:15, fontWeight:700, cursor:"pointer", border:"none", fontFamily:"inherit"}}>⭐ Assinar Premium</button>
            </Link>
            <div className="price-secure" style={{color:"#64748B"}}>🔒 Pagamento 100% seguro</div>
          </div>

        </div>
      </section>
      
      {/* FAQ */}
      <section className="faq">
        <div className="section-header">
          <div className="section-tag">Dúvidas</div>
          <h2>❓ Perguntas Frequentes</h2>
          <p>Tire todas as suas dúvidas sobre o EstéticaPro</p>
        </div>
        <div className="faq-inner">
          {faqData.map((item, i) => (
            <div key={i} style={{background:"#fff", borderRadius:12, marginBottom:10, border: openFaq === i ? "1px solid #4F8EF7" : "1px solid #E2E8F0", overflow:"hidden", boxShadow: openFaq === i ? "0 4px 20px rgba(79,142,247,0.1)" : "none"}}>
              <button className="faq-trigger" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <span className="faq-q">{item.q}</span>
                <span className="faq-icon" style={{background: openFaq === i ? "#4F8EF7" : "#EEF2FB", color: openFaq === i ? "#fff" : "#4F8EF7", transform: openFaq === i ? "rotate(45deg)" : "rotate(0deg)"}}>+</span>
              </button>
              {openFaq === i && <p className="faq-answer">{item.a}</p>}
            </div>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="cta-final">
        <div className="cta-final-inner">
          <h2>Chega de perder agendamentos por <em>falta de organização</em></h2>
          <p>Organize sua estética, controle seus clientes e cresça de verdade — ainda hoje.</p>
          <div className="cta-pills">
            {["🚗 Agenda organizada","👤 Clientes cadastrados","💬 WhatsApp integrado","📊 Dashboard completo","📱 100% Mobile"].map((p,i) => <span key={i} className="cta-pill">{p}</span>)}
          </div>
          <button className="btn-primary" onClick={scrollToPrecos} style={{margin:"0 auto",display:"block",fontSize:"18px",padding:"20px 60px"}}>COMEÇAR AGORA</button>
          <div className="cta-seals">
            <span className="cta-seal">🔒 Pagamento seguro</span>
            <span className="cta-seal">📲 Acesso imediato</span>
            <span className="cta-seal">⭐ Suporte WhatsApp</span>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <p>© 2025 EstéticaPro — Todos os direitos reservados</p>
        <div className="footer-links">
          <a href="/termos-de-uso">Termos de Uso</a>
          <a href="/politica-de-privacidade">Política de Privacidade</a>
        </div>
      </footer>

      {/* WHATSAPP FLOAT */}
      <div className="wpp-float">
        <div className={`wpp-bubble ${chatOpen ? "visible" : ""}`}>
          <div className="wpp-header">
            <div className="wpp-avatar">🚗</div>
            <div style={{flex:1}}>
              <div className="wpp-header-name">EstéticaPro</div>
              <div className="wpp-header-status">● Online agora</div>
            </div>
            <button className="wpp-close" onClick={() => setChatOpen(false)}>✕</button>
          </div>
          <div className="wpp-messages">
            <div className={`wpp-msg ${chatStep >= 1 ? "show" : ""}`}>
              Olá! 👋 Ficou alguma dúvida sobre o EstéticaPro?
              <div className="wpp-msg-time">agora</div>
            </div>
            <div className={`wpp-typing ${chatStep === 1 ? "show" : ""}`} style={{display: chatStep === 1 ? "flex" : "none"}}>
              <span/><span/><span/>
            </div>
            <div className={`wpp-msg ${chatStep >= 2 ? "show" : ""}`}>
              Nossa equipe está pronta para te ajudar a começar! 🚀
              <div className="wpp-msg-time">agora</div>
            </div>
          </div>
          <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="wpp-cta-btn">
            💬 Falar com a equipe
          </a>
        </div>
        <button className="wpp-fab" onClick={() => { setChatOpen(!chatOpen); if (!chatOpen) setChatStep(0); }}>
          {chatOpen ? (
            <svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
          ) : (
            <svg viewBox="0 0 24 24"><path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/></svg>
          )}
          {!chatOpen && <div className="wpp-notify">1</div>}
        </button>
      </div>
    </>
  );
}