"use client";
import Link from "next/link";
import { useEffect } from "react";

export default function ObrigadoPage() {
  useEffect(() => {
    // Redireciona para login após 10 segundos
    const t = setTimeout(() => {
      window.location.href = "/login";
    }, 10000);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        .outer { min-height: 100vh; background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%); display: flex; align-items: center; justify-content: center; padding: 40px 20px; font-family: 'Inter', sans-serif; }
        .card { background: #fff; border-radius: 24px; padding: 48px 40px; max-width: 480px; width: 100%; text-align: center; box-shadow: 0 24px 64px rgba(0,0,0,0.3); }
        .icon { font-size: 72px; margin-bottom: 24px; }
        .title { font-size: 28px; font-weight: 800; color: #1E293B; margin-bottom: 12px; }
        .sub { font-size: 15px; color: #64748B; line-height: 1.7; margin-bottom: 32px; }
        .wpp-box { background: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 12px; padding: 16px 20px; margin-bottom: 28px; font-size: 14px; color: #16A34A; font-weight: 600; line-height: 1.6; }
        .btn { display: block; width: 100%; padding: 14px; background: #4F8EF7; color: #fff; border: none; border-radius: 12px; font-size: 15px; font-weight: 700; cursor: pointer; text-decoration: none; text-align: center; font-family: inherit; transition: background 0.2s; }
        .btn:hover { background: #2563EB; }
        .redirect-note { font-size: 12px; color: #94A3B8; margin-top: 16px; }
      `}</style>

      <div className="outer">
        <div className="card">
          <div className="icon">🎉</div>
          <div className="title">Pagamento confirmado!</div>
          <div className="sub">
            Bem-vindo ao <strong>EstéticaPro</strong>! Sua assinatura foi ativada com sucesso.
          </div>
          <div className="wpp-box">
            📱 Enviamos seus dados de acesso via <strong>WhatsApp</strong>.<br />
            Verifique sua conta e faça login para começar!
          </div>
          <Link href="/login" className="btn">
            🚀 Fazer login agora
          </Link>
          <div className="redirect-note">Você será redirecionado automaticamente em 10 segundos.</div>
        </div>
      </div>
    </>
  );
}