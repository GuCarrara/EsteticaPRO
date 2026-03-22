"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function AssinarForm() {
  const searchParams = useSearchParams();
  const planParam = searchParams.get("plano") || "mensal";

  const [plan, setPlan] = useState(planParam);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const plans = {
    mensal: { label: "Mensal", price: "R$ 97,90/mês", value: 97.90 },
    anual: { label: "Anual", price: "R$ 79,90/mês (cobrado anualmente)", value: 957.80 },
  };

  const handleSubmit = async () => {
    if (!name || !email || !cpf) {
      setError("Preencha todos os campos obrigatórios!");
      return;
    }
    setLoading(true);
    setError("");

    const res = await fetch("/api/billing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, cpf, phone, plan }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Erro ao processar. Tente novamente.");
      return;
    }

    // Redireciona para o link de pagamento do Asaas
    window.location.href = data.paymentLink;
  };

  return (
    <>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; }
        .outer { min-height: 100vh; background: #F1F5F9; display: flex; align-items: center; justify-content: center; padding: 40px 20px; }
        .inner { max-width: 480px; width: 100%; }
        .logo { font-size: 28px; font-weight: 800; color: #1E293B; text-align: center; margin-bottom: 8px; }
        .logo span { color: #4F8EF7; }
        .subtitle { font-size: 15px; color: #64748B; text-align: center; margin-bottom: 32px; }
        .plan-toggle { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 24px; }
        .plan-btn { padding: 12px; border-radius: 10px; border: 1.5px solid #E2E8F0; background: #fff; font-size: 14px; font-weight: 600; cursor: pointer; text-align: center; transition: all 0.2s; font-family: inherit; }
        .plan-btn.active { background: #4F8EF7; color: #fff; border-color: #4F8EF7; }
        .plan-price { font-size: 12px; font-weight: 400; display: block; margin-top: 2px; opacity: 0.8; }
        .card { background: #fff; border-radius: 20px; padding: 32px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
        .card-title { font-size: 18px; font-weight: 700; color: #1E293B; margin-bottom: 24px; }
        .form-label { font-size: 13px; font-weight: 600; color: #475569; display: block; margin-bottom: 6px; }
        .form-input { width: 100%; padding: 12px 14px; border: 1.5px solid #E2E8F0; border-radius: 10px; font-size: 14px; font-family: inherit; outline: none; background: #F8FAFC; margin-bottom: 16px; }
        .form-input:focus { border-color: #4F8EF7; background: #fff; }
        .submit-btn { width: 100%; padding: 16px; background: #4F8EF7; color: #fff; border: none; border-radius: 12px; font-size: 16px; font-weight: 700; cursor: pointer; font-family: inherit; transition: background 0.2s; margin-top: 8px; }
        .submit-btn:hover { background: #2563EB; }
        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .error { background: #FEF2F2; border: 1px solid #FECACA; color: #DC2626; padding: 10px 14px; border-radius: 8px; font-size: 13px; margin-bottom: 16px; }
        .secure { text-align: center; font-size: 12px; color: #94A3B8; margin-top: 16px; }
        .back { display: block; text-align: center; margin-top: 16px; font-size: 13px; color: #4F8EF7; text-decoration: none; }
        .summary { background: #EFF6FF; border-radius: 12px; padding: 16px; margin-bottom: 24px; }
        .summary-plan { font-size: 15px; font-weight: 700; color: #1E293B; }
        .summary-price { font-size: 13px; color: #4F8EF7; font-weight: 600; margin-top: 4px; }
      `}</style>

      <div className="outer">
        <div className="inner">
          <div className="logo">Estética<span>Pro</span></div>
          <div className="subtitle">Comece a organizar sua estética hoje</div>

          {/* Seletor de plano */}
          <div className="plan-toggle">
            <button className={`plan-btn ${plan === "mensal" ? "active" : ""}`} onClick={() => setPlan("mensal")}>
              Mensal
              <span className="plan-price">R$ 97,90/mês</span>
            </button>
            <button className={`plan-btn ${plan === "anual" ? "active" : ""}`} onClick={() => setPlan("anual")}>
              Anual 🔥
              <span className="plan-price">R$ 79,90/mês</span>
            </button>
          </div>

          <div className="card">
            <div className="summary">
              <div className="summary-plan">Plano {plans[plan as keyof typeof plans].label}</div>
              <div className="summary-price">{plans[plan as keyof typeof plans].price}</div>
            </div>

            <div className="card-title">Seus dados</div>

            {error && <div className="error">{error}</div>}

            <label className="form-label">Nome completo *</label>
            <input className="form-input" placeholder="Seu nome completo" value={name} onChange={e => setName(e.target.value)} />

            <label className="form-label">E-mail *</label>
            <input className="form-input" type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} />

            <label className="form-label">CPF *</label>
            <input className="form-input" placeholder="000.000.000-00" value={cpf} onChange={e => setCpf(e.target.value)} />

            <label className="form-label">Telefone</label>
            <input className="form-input" placeholder="(11) 99999-9999" value={phone} onChange={e => setPhone(e.target.value)} />

            <button className="submit-btn" onClick={handleSubmit} disabled={loading}>
              {loading ? "Processando..." : "🚀 Continuar para pagamento"}
            </button>

            <div className="secure">🔒 Pagamento 100% seguro via Asaas</div>
          </div>

          <a href="/" className="back">← Voltar para a página inicial</a>
        </div>
      </div>
    </>
  );
}

export default function AssinarPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <AssinarForm />
    </Suspense>
  );
}