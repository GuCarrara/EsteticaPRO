"use client";
import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function DefinirSenhaContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const code = searchParams.get("code") || "";
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSalvar = async () => {
    if (!password || password.length < 6) { setError("Senha deve ter pelo menos 6 caracteres!"); return; }
    if (password !== confirmPassword) { setError("As senhas não conferem!"); return; }
    setLoading(true); setError("");

    const res = await fetch("/api/auth-code", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code, password }),
    });

    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error || "Erro ao salvar senha."); return; }
    router.push("/login?novo=1");
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
        .secure { text-align: center; font-size: 12px; color: #94A3B8; margin-top: 14px; }
      `}</style>

      <div className="outer">
        <div className="inner">
          <img src="/logo.png" alt="EstéticaPro" style={{height:80, objectFit:"contain"}} />
          <div className="subtitle">Quase lá! Crie sua senha para acessar.</div>
          <div className="card">
            <div className="card-title">🔐 Crie sua senha</div>
            <div className="card-sub">Escolha uma senha segura para acessar o EstéticaPro.</div>
            {error && <div className="error">{error}</div>}
            <label className="form-label">Senha *</label>
            <input className="form-input" type="password" placeholder="Mínimo 6 caracteres" value={password} onChange={e => setPassword(e.target.value)} />
            <label className="form-label">Confirmar senha *</label>
            <input className="form-input" type="password" placeholder="Repita a senha" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
            <button className="btn" onClick={handleSalvar} disabled={loading}>
              {loading ? "Salvando..." : "🚀 Entrar no sistema"}
            </button>
            <div className="secure">🎁 7 dias grátis ativados!</div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function DefinirSenhaPage() {
  return (
    <Suspense fallback={<div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",color:"#64748B"}}>Carregando...</div>}>
      <DefinirSenhaContent />
    </Suspense>
  );
}