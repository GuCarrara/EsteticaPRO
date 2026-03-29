"use client";
import { useState } from "react";
import Link from "next/link";

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleEnviar = async () => {
    if (!email) { setError("Informe seu e-mail!"); return; }
    setLoading(true); setError("");
    const res = await fetch("/api/recuperar-senha", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error || "Erro ao enviar código."); return; }
    setSuccess(true);
  };

  return (
    <>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        .outer { min-height: 100vh; background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%); display: flex; align-items: center; justify-content: center; padding: 40px 20px; font-family: 'Inter', sans-serif; }
        .inner { max-width: 420px; width: 100%; }
        .logo { font-size: 26px; font-weight: 800; color: #fff; text-align: center; margin-bottom: 6px; }
        .logo span { color: #4F8EF7; }
        .subtitle { font-size: 14px; color: rgba(255,255,255,0.5); text-align: center; margin-bottom: 28px; }
        .card { background: #fff; border-radius: 20px; padding: 32px; box-shadow: 0 8px 32px rgba(0,0,0,0.3); }
        .card-title { font-size: 18px; font-weight: 700; color: #1E293B; margin-bottom: 6px; }
        .card-sub { font-size: 13px; color: #64748B; margin-bottom: 24px; line-height: 1.6; }
        .form-label { font-size: 13px; font-weight: 600; color: #475569; display: block; margin-bottom: 6px; }
        .form-input { width: 100%; padding: 12px 14px; border: 1.5px solid #E2E8F0; border-radius: 10px; font-size: 14px; font-family: inherit; outline: none; background: #F8FAFC; margin-bottom: 16px; color: #1E293B; }
        .form-input:focus { border-color: #4F8EF7; background: #fff; }
        .btn { width: 100%; padding: 14px; background: #4F8EF7; color: #fff; border: none; border-radius: 12px; font-size: 15px; font-weight: 700; cursor: pointer; font-family: inherit; transition: background 0.2s; }
        .btn:hover { background: #2563EB; }
        .btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .error { background: #FEF2F2; border: 1px solid #FECACA; color: #DC2626; padding: 10px 14px; border-radius: 8px; font-size: 13px; margin-bottom: 16px; }
        .success { background: #F0FDF4; border: 1px solid #BBF7D0; color: #16A34A; padding: 16px; border-radius: 10px; font-size: 14px; text-align: center; line-height: 1.6; }
        .back-link { text-align: center; margin-top: 16px; font-size: 13px; color: rgba(255,255,255,0.4); }
        .back-link a { color: #4F8EF7; text-decoration: none; font-weight: 600; }
      `}</style>

      <div className="outer">
        <div className="inner">
          <img src="/logo.png" alt="EstéticaPro" style={{height:80, objectFit:"contain"}} />
          <div className="subtitle">Recuperação de senha</div>
          <div className="card">
            <div className="card-title">🔐 Esqueceu sua senha?</div>
            <div className="card-sub">Informe seu e-mail e enviaremos um código de recuperação via WhatsApp.</div>
            {error && <div className="error">{error}</div>}
            {success ? (
              <div className="success">
                ✅ Código enviado via WhatsApp!<br />
                <strong>Verifique seu WhatsApp</strong> e use o código para redefinir sua senha.
                <br /><br />
                <Link href="/redefinir-senha" style={{color:"#16A34A", fontWeight:700}}>Já tenho o código →</Link>
              </div>
            ) : (
              <>
                <label className="form-label">E-mail *</label>
                <input className="form-input" type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} />
                <button className="btn" onClick={handleEnviar} disabled={loading}>
                  {loading ? "Enviando..." : "📱 Enviar código via WhatsApp"}
                </button>
              </>
            )}
          </div>
          <div className="back-link">
            <Link href="/login">← Voltar para o login</Link>
          </div>
        </div>
      </div>
    </>
  );
}