"use client";
import { useState, Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

function AssinarContent() {
  const searchParams = useSearchParams();
  const plano = searchParams.get("plano") || "mensal";
  const router = useRouter();
  const { data: session, status } = useSession();

  // Fluxo trial
  const [trialStep, setTrialStep] = useState<"dados" | "codigo">("dados");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");

  // Fluxo pagamento
  const [cpf, setCpf] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"PIX" | "CREDIT_CARD">("PIX");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pix, setPix] = useState<{ pixCode: string; pixImage: string } | null>(null);
  const [success, setSuccess] = useState(false);

  const isTrial = plano === "mensal";
  const isPremium = plano === "premium";
  const isLoggedIn = status === "authenticated";

  useEffect(() => {
    if (status === "loading") return;
    if (status === "authenticated" && session?.user) {
      const user = session.user as any;
      setName(user.name || "");
      setEmail(user.email || "");
    }
  }, [status, session]);

  const handleEnviarCodigo = async () => {
    if (!name || !email || !phone) { setError("Preencha todos os campos!"); return; }
    setLoading(true); setError("");
    const res = await fetch("/api/auth-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error || "Erro ao enviar código."); return; }
    setTrialStep("codigo");
  };

  const handleVerificarCodigo = () => {
    if (code.length !== 6) { setError("Digite o código de 6 dígitos!"); return; }
    setError("");
    router.push("/definir-senha?email=" + encodeURIComponent(email) + "&code=" + code);
  };

  const handlePagar = async () => {
    if (!cpf) { setError("Informe seu CPF!"); return; }
    if (!name || !email) { setError("Preencha todos os campos!"); return; }
    if (paymentMethod === "CREDIT_CARD" && (!cardNumber || !cardName || !cardExpiry || !cardCvv)) {
      setError("Preencha todos os dados do cartão!"); return;
    }
    setLoading(true); setError("");
    const [expiryMonth, expiryYear] = cardExpiry.split("/");
    const res = await fetch("/api/billing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name, email, cpf, plan: plano,
        paymentMethod,
        card: paymentMethod === "CREDIT_CARD" ? {
          holderName: cardName,
          number: cardNumber,
          expiryMonth: expiryMonth?.trim(),
          expiryYear: expiryYear?.trim(),
          cvv: cardCvv,
        } : undefined,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error || "Erro ao processar pagamento."); return; }
    if (paymentMethod === "CREDIT_CARD" && data.success) {
      setSuccess(true);
    } else if (data.pixCode) {
      setPix({ pixCode: data.pixCode, pixImage: data.pixImage });
    }
  };

  if (status === "loading") {
    return <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",color:"#64748B",fontFamily:"Inter,sans-serif"}}>Carregando...</div>;
  }

  return (
    <>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; }
        .outer { min-height: 100vh; background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%); display: flex; align-items: center; justify-content: center; padding: 40px 20px; }
        .inner { max-width: 480px; width: 100%; }
        .logo { font-size: 26px; font-weight: 800; color: #fff; text-align: center; margin-bottom: 6px; }
        .logo span { color: #4F8EF7; }
        .subtitle { font-size: 14px; color: rgba(255,255,255,0.5); text-align: center; margin-bottom: 24px; }
        .badge { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 8px 20px; border-radius: 100px; font-size: 13px; font-weight: 700; width: fit-content; margin: 0 auto 28px; }
        .badge-trial { background: rgba(22,163,74,0.15); border: 1.5px solid #16A34A; color: #4ade80; }
        .badge-premium { background: rgba(245,158,11,0.15); border: 1.5px solid #F59E0B; color: #FCD34D; }
        .badge-mensal { background: rgba(79,142,247,0.15); border: 1.5px solid #4F8EF7; color: #93C5FD; }
        .steps { display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 28px; }
        .step-dot { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; }
        .step-dot.active { background: #4F8EF7; color: #fff; }
        .step-dot.done { background: #16A34A; color: #fff; }
        .step-dot.inactive { background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.3); }
        .step-line { width: 40px; height: 2px; background: rgba(255,255,255,0.1); border-radius: 2px; }
        .step-line.done { background: #16A34A; }
        .card { background: #fff; border-radius: 20px; padding: 32px; box-shadow: 0 8px 32px rgba(0,0,0,0.3); }
        .card-title { font-size: 18px; font-weight: 700; color: #1E293B; margin-bottom: 6px; }
        .card-sub { font-size: 13px; color: #64748B; margin-bottom: 24px; line-height: 1.6; }
        .form-label { font-size: 13px; font-weight: 600; color: #475569; display: block; margin-bottom: 6px; }
        .form-input { width: 100%; padding: 12px 14px; border: 1.5px solid #E2E8F0; border-radius: 10px; font-size: 14px; font-family: inherit; outline: none; background: #F8FAFC; margin-bottom: 16px; color: #1E293B; }
        .form-input:focus { border-color: #4F8EF7; background: #fff; }
        .code-input { width: 100%; padding: 16px; border: 2px solid #E2E8F0; border-radius: 12px; font-size: 32px; font-weight: 800; letter-spacing: 12px; text-align: center; font-family: monospace; outline: none; background: #F8FAFC; margin-bottom: 16px; color: #1E293B; }
        .code-input:focus { border-color: #4F8EF7; background: #fff; }
        .payment-toggle { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 20px; }
        .payment-opt { padding: 13px; border-radius: 10px; border: 1.5px solid #E2E8F0; background: #F8FAFC; font-size: 14px; font-weight: 600; cursor: pointer; text-align: center; font-family: inherit; transition: all 0.2s; color: #475569; }
        .payment-opt.active { border-color: #4F8EF7; background: #EFF6FF; color: #2563EB; }
        .card-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .card-full { grid-column: 1 / -1; }
        .btn { width: 100%; padding: 14px; border: none; border-radius: 12px; font-size: 15px; font-weight: 700; cursor: pointer; font-family: inherit; transition: all 0.2s; margin-top: 4px; }
        .btn-primary { background: #4F8EF7; color: #fff; }
        .btn-primary:hover { background: #2563EB; }
        .btn-premium { background: linear-gradient(90deg,#F59E0B,#EF4444); color: #fff; }
        .btn-green { background: #16A34A; color: #fff; }
        .btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .error { background: #FEF2F2; border: 1px solid #FECACA; color: #DC2626; padding: 10px 14px; border-radius: 8px; font-size: 13px; margin-bottom: 16px; }
        .secure { text-align: center; font-size: 12px; color: #94A3B8; margin-top: 14px; }
        .back-link { text-align: center; margin-top: 16px; font-size: 13px; color: rgba(255,255,255,0.4); }
        .back-link a { color: #4F8EF7; text-decoration: none; font-weight: 600; }
        .resend-link { text-align: center; margin-top: 12px; font-size: 13px; color: #64748B; }
        .resend-link button { background: none; border: none; color: #4F8EF7; font-weight: 600; cursor: pointer; font-family: inherit; font-size: 13px; }
        .email-highlight { background: #EFF6FF; border-radius: 8px; padding: 8px 12px; font-size: 13px; color: #2563EB; font-weight: 600; text-align: center; margin-bottom: 16px; }
        .divider { border: none; border-top: 1px solid #E2E8F0; margin: 16px 0; }
        .pix-box { background: #F8FAFC; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 16px; border: 1px solid #E2E8F0; }
        .pix-code { font-size: 11px; color: #475569; word-break: break-all; margin: 12px 0; font-family: monospace; background: #fff; padding: 10px; border-radius: 8px; border: 1px solid #E2E8F0; }
        .user-info { background: #F0FDF4; border-radius: 10px; padding: 10px 14px; margin-bottom: 16px; font-size: 13px; color: #16A34A; font-weight: 600; }
      `}</style>

      <div className="outer">
        <div className="inner">
          <div className="logo">Estética<span>Pro</span></div>

          {/* FLUXO 1 — TRIAL (mensal, não logado) */}
          {isTrial && !isLoggedIn && (
            <>
              <div className="subtitle">Comece grátis por 7 dias — sem cartão</div>
              <div className="badge badge-trial">🎁 7 dias grátis • depois R$ 97,90/mês</div>

              <div className="steps">
                <div className={`step-dot ${trialStep === "dados" ? "active" : "done"}`}>1</div>
                <div className={`step-line ${trialStep === "codigo" ? "done" : ""}`}></div>
                <div className={`step-dot ${trialStep === "codigo" ? "active" : "inactive"}`}>2</div>
              </div>

              <div className="card">
                {trialStep === "dados" && (
                  <>
                    <div className="card-title">Seus dados</div>
                    <div className="card-sub">Preencha para criar sua conta. Sem cobrança agora!</div>
                    {error && <div className="error">{error}</div>}
                    <label className="form-label">Nome completo *</label>
                    <input className="form-input" placeholder="Seu nome completo" value={name} onChange={e => setName(e.target.value)} />
                    <label className="form-label">E-mail *</label>
                    <input className="form-input" type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} />
                    <label className="form-label">WhatsApp *</label>
                    <input className="form-input" placeholder="(11) 99999-9999" value={phone} onChange={e => setPhone(e.target.value)} />
                    <button className="btn btn-primary" onClick={handleEnviarCodigo} disabled={loading}>
                      {loading ? "Enviando..." : "Enviar código de verificação →"}
                    </button>
                    <div className="secure">🔒 Sem cartão • Sem cobrança agora</div>
                  </>
                )}

                {trialStep === "codigo" && (
                  <>
                    <div className="card-title">Verifique seu WhatsApp</div>
                    <div className="card-sub">Enviamos um código de 6 dígitos para:</div>
                    <div className="email-highlight">📱 {phone}</div>
                    {error && <div className="error">{error}</div>}
                    <label className="form-label">Código de verificação *</label>
                    <input className="code-input" placeholder="000000" maxLength={6} value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ""))} />
                    <button className="btn btn-primary" onClick={handleVerificarCodigo} disabled={loading}>
                      {loading ? "Verificando..." : "Verificar código →"}
                    </button>
                    <div className="resend-link">
                      Não recebeu?{" "}
                      <button onClick={() => { setTrialStep("dados"); setCode(""); setError(""); }}>Reenviar código</button>
                    </div>
                  </>
                )}
              </div>

              <div className="back-link">
                Já tem conta? <Link href="/login">Fazer login</Link>
              </div>
            </>
          )}

          {/* FLUXO 2 — PREMIUM (não logado) */}
          {isPremium && !isLoggedIn && !pix && !success && (
            <>
              <div className="subtitle">Assine o Premium e acesse na hora</div>
              <div className="badge badge-premium">⭐ Plano Premium — R$ 249,90/mês</div>

              <div className="card">
                <div className="card-title">💳 Dados de pagamento</div>
                <div className="card-sub">Após o pagamento você receberá e-mail com login e senha.</div>
                {error && <div className="error">{error}</div>}
                <label className="form-label">Nome completo *</label>
                <input className="form-input" placeholder="Seu nome completo" value={name} onChange={e => setName(e.target.value)} />
                <label className="form-label">E-mail *</label>
                <input className="form-input" type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} />
                <label className="form-label">CPF *</label>
                <input className="form-input" placeholder="000.000.000-00" value={cpf} onChange={e => setCpf(e.target.value)} />
                <hr className="divider" />
                <div className="form-label" style={{marginBottom:10}}>Forma de pagamento</div>
                <div className="payment-toggle">
                  <button className={`payment-opt ${paymentMethod === "PIX" ? "active" : ""}`} onClick={() => setPaymentMethod("PIX")}>📱 PIX</button>
                  <button className={`payment-opt ${paymentMethod === "CREDIT_CARD" ? "active" : ""}`} onClick={() => setPaymentMethod("CREDIT_CARD")}>💳 Cartão</button>
                </div>
                {paymentMethod === "CREDIT_CARD" && (
                  <div className="card-grid">
                    <div className="card-full">
                      <label className="form-label">Número do cartão *</label>
                      <input className="form-input" placeholder="0000 0000 0000 0000" value={cardNumber} onChange={e => setCardNumber(e.target.value)} maxLength={19} />
                    </div>
                    <div className="card-full">
                      <label className="form-label">Nome no cartão *</label>
                      <input className="form-input" placeholder="Como está no cartão" value={cardName} onChange={e => setCardName(e.target.value)} />
                    </div>
                    <div>
                      <label className="form-label">Validade *</label>
                      <input className="form-input" placeholder="MM/AA" value={cardExpiry} onChange={e => setCardExpiry(e.target.value)} maxLength={5} />
                    </div>
                    <div>
                      <label className="form-label">CVV *</label>
                      <input className="form-input" placeholder="000" value={cardCvv} onChange={e => setCardCvv(e.target.value)} maxLength={4} />
                    </div>
                  </div>
                )}
                <button className="btn btn-premium" onClick={handlePagar} disabled={loading}>
                  {loading ? "Processando..." : paymentMethod === "PIX" ? "📱 Gerar PIX — R$ 249,90" : "💳 Pagar — R$ 249,90"}
                </button>
                <div className="secure">🔒 Pagamento 100% seguro via Asaas</div>
              </div>

              <div className="back-link">
                Já tem conta? <Link href="/login">Fazer login</Link>
              </div>
            </>
          )}

          {/* FLUXO 3 — LOGADO (pós-trial) */}
          {isLoggedIn && !pix && !success && (
            <>
              <div className="subtitle">Escolha seu plano para continuar</div>
              <div className={`badge ${plano === "premium" ? "badge-premium" : "badge-mensal"}`}>
                {plano === "premium" ? "⭐ Plano Premium — R$ 249,90/mês" : "💳 Plano Mensal — R$ 97,90/mês"}
              </div>

              <div className="card">
                <div className="card-title">💳 Dados de pagamento</div>
                <div className="card-sub">Bem-vindo(a) de volta, {name || email}!</div>
                {error && <div className="error">{error}</div>}
                <label className="form-label">CPF *</label>
                <input className="form-input" placeholder="000.000.000-00" value={cpf} onChange={e => setCpf(e.target.value)} />
                <hr className="divider" />
                <div className="form-label" style={{marginBottom:10}}>Forma de pagamento</div>
                <div className="payment-toggle">
                  <button className={`payment-opt ${paymentMethod === "PIX" ? "active" : ""}`} onClick={() => setPaymentMethod("PIX")}>📱 PIX</button>
                  <button className={`payment-opt ${paymentMethod === "CREDIT_CARD" ? "active" : ""}`} onClick={() => setPaymentMethod("CREDIT_CARD")}>💳 Cartão</button>
                </div>
                {paymentMethod === "CREDIT_CARD" && (
                  <div className="card-grid">
                    <div className="card-full">
                      <label className="form-label">Número do cartão *</label>
                      <input className="form-input" placeholder="0000 0000 0000 0000" value={cardNumber} onChange={e => setCardNumber(e.target.value)} maxLength={19} />
                    </div>
                    <div className="card-full">
                      <label className="form-label">Nome no cartão *</label>
                      <input className="form-input" placeholder="Como está no cartão" value={cardName} onChange={e => setCardName(e.target.value)} />
                    </div>
                    <div>
                      <label className="form-label">Validade *</label>
                      <input className="form-input" placeholder="MM/AA" value={cardExpiry} onChange={e => setCardExpiry(e.target.value)} maxLength={5} />
                    </div>
                    <div>
                      <label className="form-label">CVV *</label>
                      <input className="form-input" placeholder="000" value={cardCvv} onChange={e => setCardCvv(e.target.value)} maxLength={4} />
                    </div>
                  </div>
                )}
                <button
                  className={`btn ${plano === "premium" ? "btn-premium" : "btn-primary"}`}
                  onClick={handlePagar}
                  disabled={loading}
                >
                  {loading ? "Processando..." : paymentMethod === "PIX"
                    ? `📱 Gerar PIX — ${plano === "premium" ? "R$ 249,90" : "R$ 97,90"}`
                    : `💳 Pagar — ${plano === "premium" ? "R$ 249,90" : "R$ 97,90"}`}
                </button>
                <div className="secure">🔒 Pagamento 100% seguro via Asaas</div>
              </div>

              <div className="back-link">
                <Link href="/assinatura">← Voltar para assinatura</Link>
              </div>
            </>
          )}

          {/* PIX Gerado */}
          {pix && !success && (
            <div className="card">
              <div className="card-title">📱 Pague via PIX</div>
              <div className="card-sub">Escaneie o QR Code ou copie o código. Você receberá e-mail com acesso em até 5 minutos.</div>
              <div className="pix-box">
                {pix.pixImage && (
                  <img src={`data:image/png;base64,${pix.pixImage}`} alt="QR Code PIX" style={{width:180, height:180, margin:"0 auto", display:"block"}} />
                )}
                <div className="pix-code">{pix.pixCode}</div>
                <button className="btn btn-green" onClick={() => navigator.clipboard.writeText(pix.pixCode)}>
                  📋 Copiar código PIX
                </button>
              </div>
            </div>
          )}

          {/* Cartão aprovado */}
          {success && (
            <div className="card" style={{textAlign:"center", padding:"40px 32px"}}>
              <div style={{fontSize:56, marginBottom:16}}>🎉</div>
              <div style={{fontSize:20, fontWeight:800, color:"#1E293B", marginBottom:8}}>Pagamento confirmado!</div>
              <div style={{fontSize:14, color:"#64748B", lineHeight:1.7, marginBottom:24}}>
                Verifique seu e-mail para encontrar seu login e senha.
              </div>
              <Link href="/login" style={{display:"block", padding:"14px", background:"#4F8EF7", color:"#fff", borderRadius:12, fontWeight:700, fontSize:15, textDecoration:"none"}}>
                Fazer login →
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default function AssinarPage() {
  return (
    <Suspense fallback={<div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",fontFamily:"Inter,sans-serif",color:"#64748B"}}>Carregando...</div>}>
      <AssinarContent />
    </Suspense>
  );
}