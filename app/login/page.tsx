"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("E-mail ou senha incorretos.");
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; }
        .login-outer { min-height: 100vh; background: #1E293B; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .login-card { background: #fff; border-radius: 20px; padding: 48px 40px; width: 100%; max-width: 420px; box-shadow: 0 24px 64px rgba(0,0,0,0.3); }
        .login-logo { font-size: 28px; font-weight: 800; color: #1E293B; margin-bottom: 8px; }
        .login-logo span { color: #4F8EF7; }
        .login-sub { font-size: 14px; color: #64748B; margin-bottom: 32px; }
        .login-label { font-size: 13px; font-weight: 600; color: #475569; display: block; margin-bottom: 6px; }
        .login-input { width: 100%; padding: 12px 14px; border: 1.5px solid #E2E8F0; border-radius: 10px; font-size: 14px; color: #1E293B; background: #F8FAFC; font-family: inherit; outline: none; margin-bottom: 16px; }
        .login-input:focus { border-color: #4F8EF7; background: #fff; }
        .login-btn { width: 100%; padding: 14px; background: #4F8EF7; color: #fff; border: none; border-radius: 10px; font-size: 15px; font-weight: 700; cursor: pointer; font-family: inherit; transition: background 0.2s; margin-top: 8px; }
        .login-btn:hover { background: #2563EB; }
        .login-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .login-error { background: #FEF2F2; border: 1px solid #FECACA; color: #DC2626; padding: 10px 14px; border-radius: 8px; font-size: 13px; margin-bottom: 16px; }
        .login-footer { text-align: center; margin-top: 24px; font-size: 13px; color: #94A3B8; }
        .login-footer a { color: #4F8EF7; text-decoration: none; font-weight: 600; }
      `}</style>

      <div className="login-outer">
        <div className="login-card">
          <div className="login-logo">Estética<span>Pro</span></div>
          <div className="login-sub">Entre na sua conta para continuar</div>

          <form onSubmit={handleSubmit}>
            {error && <div className="login-error">{error}</div>}
            <label className="login-label">E-mail</label>
            <input
              className="login-input"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <label className="login-label">Senha</label>
            <input
              className="login-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button className="login-btn" type="submit" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <div className="login-footer">
            <a href="/recuperar-senha" style={{color:"#4F8EF7", textDecoration:"none", fontSize:13}}>Esqueceu sua senha?</a>
          </div>
          <div className="login-footer">
            Não tem conta? <a href="/assinar">Assine agora</a>
          </div>
        </div>
      </div>
    </>
  );
}