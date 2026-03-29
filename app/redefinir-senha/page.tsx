"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RedefinirSenhaPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRedefinir = async () => {
    if (!email || !code || !password) { setError("Preencha todos os campos!"); return; }
    if (password.length < 6) { setError("Senha deve ter pelo menos 6 caracteres!"); return; }
    if (password !== confirmPassword) { setError("As senhas não conferem!"); return; }
    setLoading(true); setError("");

    const res = await fetch("/api/redefinir-senha", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error || "Erro ao redefinir senha."); return; }
    router.push("/login?senha=redefinida");
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
        .code-input { width: 100%; padding: 16px; border: 2px solid #E2E8F0; border-radius: 12px; font-size: 28px; font-weight: 800; letter-spacing: 12px; text-align: center; font-family: monospace; outline: none; background: #F8FAFC; margin-bottom: 16px; color: #1E293B; }
        .code-input:focus { border-color: #4F8EF7; background: #fff; }
        .btn { width: 100%; padding: 14px; background: #4F8EF7; color: #fff; border: none; border-radius: 12px; font-size: 15px; font-weight: 700; cursor: pointer; font-family: inherit; transition: background 0.2s; }
        .btn:hover { background: #2563EB; }
        .btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .error { background: #FEF2F2; border: 1px solid #FECACA; color: #DC2626; padding: 10px 14px; border-radius: 8px; font-size: 13px; margin-bottom: 16px; }
        .back-link { text-align: center; margin-top: 16px; font-size: 13px; color: rgba(255,255,255,0.4); }
        .back-link a { color: #4F8EF7; text-decoration: none; font-weight: 600; }
      `}</style>

      <div className="outer">
        <div className="inner">
          <div className="logo">Estética<span>Pro</span></div>
          <div className="subtitle">Redefinição de senha</div>
          <div className="card">
            <div className="card-title">🔑 Redefinir senha</div>
            <div className="card-sub">Digite o código recebido no WhatsApp e sua nova senha.</div>
            {error && <div className="error">{error}</div>}
            <label className="form-label">E-mail *</label>
            <input className="form-input" type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} />
            <label className="form-label">Código recebido no WhatsApp *</label>
            <input className="code-input" placeholder="000000" maxLength={6} value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ""))} />
            <label className="form-label">Nova senha *</label>
            <input className="form-input" type="password" placeholder="Mínimo 6 caracteres" value={password} onChange={e => setPassword(e.target.value)} />
            <label className="form-label">Confirmar nova senha *</label>
            <input className="form-input" type="password" placeholder="Repita a senha" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
            <button className="btn" onClick={handleRedefinir} disabled={loading}>
              {loading ? "Salvando..." : "✅ Redefinir senha"}
            </button>
          </div>
          <div className="back-link">
            <Link href="/login">← Voltar para o login</Link>
          </div>
        </div>
      </div>
    </>
  );
}