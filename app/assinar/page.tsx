"use client";
import { useState } from "react";

export default function AssinarPage() {
  const [loading, setLoading] = useState(false);

  const whatsappLink = "https://wa.me/5511999999999?text=Olá,%20quero%20assinar%20o%20EstéticaPro!";

  const plans = [
    {
      name: "Mensal",
      price: "97,90",
      period: "/mês",
      description: "Ideal para começar",
      features: [
        "Agenda de agendamentos",
        "Cadastro de clientes e veículos",
        "Gestão de serviços",
        "Confirmação via WhatsApp",
        "Suporte por WhatsApp",
      ],
      cta: "Assinar Mensal",
      featured: false,
    },
    {
      name: "Anual",
      price: "79,90",
      period: "/mês",
      description: "Melhor custo-benefício",
      save: "Economize 2 meses",
      features: [
        "Agenda de agendamentos",
        "Cadastro de clientes e veículos",
        "Gestão de serviços",
        "Confirmação via WhatsApp",
        "Suporte prioritário",
        "Relatórios financeiros",
        "Usuários ilimitados",
      ],
      cta: "Assinar Anual",
      featured: true,
    },
  ];

  return (
    <>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; }
        .assinar-outer { min-height: 100vh; background: #F1F5F9; display: flex; align-items: center; justify-content: center; padding: 40px 20px; }
        .assinar-inner { max-width: 860px; width: 100%; }
        .assinar-title { font-size: 32px; font-weight: 800; color: #1E293B; text-align: center; margin-bottom: 8px; }
        .assinar-title span { color: #4F8EF7; }
        .assinar-sub { font-size: 16px; color: #64748B; text-align: center; margin-bottom: 48px; }
        .plans-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 32px; }
        .plan-card { background: #fff; border-radius: 20px; padding: 36px 28px; border: 1.5px solid #E2E8F0; position: relative; }
        .plan-card.featured { background: linear-gradient(160deg, #EFF6FF 0%, #DBEAFE 100%); border-color: #4F8EF7; box-shadow: 0 24px 64px rgba(79,142,247,0.2); transform: translateY(-8px); }
        .plan-badge { position: absolute; top: -14px; left: 50%; transform: translateX(-50%); background: #4F8EF7; color: #fff; padding: 6px 20px; border-radius: 100px; font-size: 11px; font-weight: 700; letter-spacing: 1px; white-space: nowrap; }
        .plan-name { font-size: 24px; font-weight: 800; color: #1E293B; text-align: center; margin-bottom: 8px; }
        .plan-save { background: #DBEAFE; color: #2563EB; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 100px; text-align: center; margin-bottom: 12px; display: inline-block; width: 100%; }
        .plan-desc { font-size: 13px; color: #64748B; text-align: center; margin-bottom: 20px; }
        .plan-price { text-align: center; margin-bottom: 24px; }
        .plan-price strong { font-size: 44px; font-weight: 800; color: #4F8EF7; }
        .plan-price span { font-size: 15px; color: #64748B; }
        .plan-divider { border: none; border-top: 1px solid #E2E8F0; margin: 20px 0; }
        .plan-features { display: flex; flex-direction: column; gap: 10px; margin-bottom: 28px; }
        .plan-feature { display: flex; align-items: center; gap: 8px; font-size: 14px; color: #475569; }
        .plan-check { color: #4F8EF7; flex-shrink: 0; }
        .plan-btn { width: 100%; padding: 14px; background: #4F8EF7; color: #fff; border: none; border-radius: 10px; font-size: 15px; font-weight: 700; cursor: pointer; font-family: inherit; transition: background 0.2s; text-decoration: none; display: block; text-align: center; }
        .plan-btn:hover { background: #2563EB; }
        .plan-secure { text-align: center; font-size: 11px; color: #94A3B8; margin-top: 10px; }
        .assinar-wpp { text-align: center; }
        .assinar-wpp a { display: inline-flex; align-items: center; gap: 8px; background: #25D366; color: #fff; padding: 14px 32px; border-radius: 100px; font-size: 15px; font-weight: 700; text-decoration: none; transition: background 0.2s; }
        .assinar-wpp a:hover { background: #128C7E; }
        .assinar-wpp p { font-size: 13px; color: #94A3B8; margin-top: 12px; }
        @media (max-width: 640px) {
          .plans-grid { grid-template-columns: 1fr; }
          .plan-card.featured { transform: none; }
        }
      `}</style>

      <div className="assinar-outer">
        <div className="assinar-inner">
          <div className="assinar-title">Estética<span>Pro</span></div>
          <div className="assinar-sub">Escolha o plano ideal para sua estética automotiva</div>

          <div className="plans-grid">
            {plans.map((plan, i) => (
              <div key={i} className={`plan-card ${plan.featured ? "featured" : ""}`}>
                {plan.featured && <div className="plan-badge">🔥 MAIS POPULAR</div>}
                <div className="plan-name">{plan.name}</div>
                {plan.save && <div className="plan-save">{plan.save}</div>}
                <div className="plan-desc">{plan.description}</div>
                <div className="plan-price">
                  <strong>{plan.price}</strong>
                  <span>{plan.period}</span>
                </div>
                <hr className="plan-divider" />
                <div className="plan-features">
                  {plan.features.map((f, j) => (
                    <div key={j} className="plan-feature">
                      <span className="plan-check">✓</span>
                      {f}
                    </div>
                  ))}
                </div>
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="plan-btn">
                  {plan.cta}
                </a>
                <div className="plan-secure">🔒 Pagamento 100% seguro</div>
              </div>
            ))}
          </div>

          <div className="assinar-wpp">
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
              💬 Falar com a equipe antes de assinar
            </a>
            <p>Tire suas dúvidas pelo WhatsApp antes de contratar</p>
          </div>
        </div>
      </div>
    </>
  );
}