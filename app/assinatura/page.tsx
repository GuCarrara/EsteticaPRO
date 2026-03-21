"use client";
import { useEffect, useState } from "react";

export default function AssinaturaPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [cancelMsg, setCancelMsg] = useState("");

  const whatsappLink = "https://wa.me/5511999999999?text=Olá,%20preciso%20de%20ajuda%20com%20minha%20assinatura%20EstéticaPro";

  useEffect(() => {
    fetch("/api/assinatura")
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const formatDate = (date: string) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
  };

  const getStatus = () => {
    if (!data) return null;
    if (!data.isPaid) return { label: "Bloqueado", color: "#DC2626", bg: "#FEF2F2", border: "#FECACA", icon: "🔒" };
    if (data.daysLeft !== null && data.daysLeft <= 5 && data.daysLeft > 0) return { label: "Vencendo em breve", color: "#D97706", bg: "#FFFBEB", border: "#FDE68A", icon: "⚠️" };
    if (data.daysLeft !== null && data.daysLeft <= 0) return { label: "Vencido", color: "#DC2626", bg: "#FEF2F2", border: "#FECACA", icon: "🚨" };
    return { label: "Ativo", color: "#16A34A", bg: "#F0FDF4", border: "#BBF7D0", icon: "✅" };
  };

  const handleCancel = async () => {
    setCanceling(true);
    try {
      const res = await fetch("/api/assinatura/cancelar", { method: "POST" });
      const json = await res.json();
      if (res.ok) {
        setCancelMsg("✅ Assinatura cancelada. Seu acesso permanece ativo até o fim do período pago.");
        setShowConfirm(false);
      } else {
        setCancelMsg(json.error || "Erro ao cancelar. Entre em contato com o suporte.");
        setShowConfirm(false);
      }
    } catch {
      setCancelMsg("Erro ao cancelar. Entre em contato com o suporte.");
      setShowConfirm(false);
    }
    setCanceling(false);
  };

  const status = getStatus();

  return (
    <>
      <style>{`
        .assl-wrapper { max-width: 680px; margin: 0 auto; padding: 8px 0 40px; }
        .assl-title { font-size: 24px; font-weight: 700; color: #1E293B; margin-bottom: 4px; }
        .assl-sub { font-size: 14px; color: #64748B; margin-bottom: 32px; }
        .assl-card { background: #fff; border-radius: 16px; border: 1px solid #E2E8F0; padding: 28px; margin-bottom: 16px; box-shadow: 0 2px 12px rgba(0,0,0,0.04); }
        .assl-card-title { font-size: 13px; font-weight: 700; color: #94A3B8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 20px; }
        .assl-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #F1F5F9; }
        .assl-row:last-child { border-bottom: none; padding-bottom: 0; }
        .assl-label { font-size: 14px; color: #64748B; }
        .assl-value { font-size: 14px; font-weight: 600; color: #1E293B; }
        .assl-badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 100px; font-size: 13px; font-weight: 600; }
        .assl-alert { border-radius: 14px; padding: 20px 24px; margin-bottom: 16px; border: 1px solid; display: flex; align-items: flex-start; gap: 14px; }
        .assl-alert-icon { font-size: 22px; flex-shrink: 0; }
        .assl-alert-title { font-size: 15px; font-weight: 700; margin-bottom: 4px; }
        .assl-alert-text { font-size: 13px; line-height: 1.6; opacity: 0.85; }
        .assl-progress-bar { background: #E2E8F0; border-radius: 100px; height: 8px; margin-top: 16px; overflow: hidden; }
        .assl-progress-fill { height: 100%; border-radius: 100px; transition: width 0.5s ease; }
        .assl-progress-label { display: flex; justify-content: space-between; font-size: 12px; color: #94A3B8; margin-top: 6px; }
        .assl-btn { display: block; width: 100%; padding: 14px; background: #4F8EF7; color: #fff; border: none; border-radius: 10px; font-size: 15px; font-weight: 700; cursor: pointer; text-align: center; text-decoration: none; transition: background 0.2s; font-family: inherit; margin-bottom: 10px; }
        .assl-btn:hover { background: #2563EB; }
        .assl-btn-wpp { background: #25D366; }
        .assl-btn-wpp:hover { background: #128C7E; }
        .assl-btn-cancel { background: #fff; color: #DC2626; border: 1.5px solid #FECACA; }
        .assl-btn-cancel:hover { background: #FEF2F2; }
        .assl-cancel-note { font-size: 12px; color: #94A3B8; text-align: center; margin-top: 8px; line-height: 1.6; }
        .assl-skeleton { background: linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%); background-size: 200% 100%; animation: shimmer 1.2s infinite; border-radius: 8px; height: 18px; }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        .assl-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .assl-modal { background: #fff; border-radius: 20px; padding: 36px 32px; max-width: 420px; width: 100%; box-shadow: 0 24px 64px rgba(0,0,0,0.2); text-align: center; }
        .assl-modal-icon { font-size: 48px; margin-bottom: 16px; }
        .assl-modal-title { font-size: 20px; font-weight: 700; color: #1E293B; margin-bottom: 10px; }
        .assl-modal-text { font-size: 14px; color: #64748B; line-height: 1.7; margin-bottom: 28px; }
        .assl-modal-btns { display: flex; gap: 12px; }
        .assl-modal-btn-yes { flex: 1; padding: 13px; background: #DC2626; color: #fff; border: none; border-radius: 10px; font-size: 15px; font-weight: 700; cursor: pointer; font-family: inherit; }
        .assl-modal-btn-yes:hover { background: #B91C1C; }
        .assl-modal-btn-no { flex: 1; padding: 13px; background: #F1F5F9; color: #1E293B; border: none; border-radius: 10px; font-size: 15px; font-weight: 700; cursor: pointer; font-family: inherit; }
        .assl-modal-btn-no:hover { background: #E2E8F0; }
      `}</style>

      {showConfirm && (
        <div className="assl-overlay" onClick={() => setShowConfirm(false)}>
          <div className="assl-modal" onClick={e => e.stopPropagation()}>
            <div className="assl-modal-icon">⚠️</div>
            <div className="assl-modal-title">Tem certeza que deseja cancelar?</div>
            <div className="assl-modal-text">
              Ao cancelar, sua assinatura não será renovada automaticamente. Você continuará com acesso até o fim do período já pago.
            </div>
            <div className="assl-modal-btns">
              <button className="assl-modal-btn-yes" onClick={handleCancel} disabled={canceling}>
                {canceling ? "Cancelando..." : "Sim, cancelar"}
              </button>
              <button className="assl-modal-btn-no" onClick={() => setShowConfirm(false)}>
                Não, voltar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="assl-wrapper">
        <div className="assl-title">💳 Minha Assinatura</div>
        <div className="assl-sub">Gerencie seu plano e acompanhe o status do seu acesso</div>

        {loading ? (
          <div className="assl-card">
            <div className="assl-skeleton" style={{width:"40%", marginBottom:20}}></div>
            <div className="assl-skeleton" style={{marginBottom:12}}></div>
            <div className="assl-skeleton" style={{width:"70%"}}></div>
          </div>
        ) : !data || data.error ? (
          <div className="assl-card" style={{textAlign:"center", color:"#64748B"}}>
            Erro ao carregar dados da assinatura.
          </div>
        ) : (
          <>
            {!data.isPaid && (
              <div className="assl-alert" style={{background:"#FEF2F2", borderColor:"#FECACA", color:"#DC2626"}}>
                <div className="assl-alert-icon">🔒</div>
                <div>
                  <div className="assl-alert-title">Acesso bloqueado</div>
                  <div className="assl-alert-text">Sua assinatura está em atraso. Efetue o pagamento para reativar o acesso.</div>
                </div>
              </div>
            )}

            {cancelMsg && (
              <div className="assl-alert" style={{background:"#F0FDF4", borderColor:"#BBF7D0", color:"#16A34A"}}>
                <div className="assl-alert-icon">✅</div>
                <div>
                  <div className="assl-alert-title">Assinatura cancelada</div>
                  <div className="assl-alert-text">{cancelMsg}</div>
                </div>
              </div>
            )}

            <div className="assl-card">
              <div className="assl-card-title">Detalhes do Plano</div>
              <div className="assl-row">
                <span className="assl-label">Status</span>
                <span className="assl-badge" style={{background: status?.bg, color: status?.color, border: `1px solid ${status?.border}`}}>
                  {status?.icon} {status?.label}
                </span>
              </div>
              <div className="assl-row">
                <span className="assl-label">Plano</span>
                <span className="assl-value">{data.planType ? data.planType.charAt(0).toUpperCase() + data.planType.slice(1) : "—"}</span>
              </div>
              <div className="assl-row">
                <span className="assl-label">Último pagamento</span>
                <span className="assl-value">{formatDate(data.paidAt)}</span>
              </div>
              <div className="assl-row">
                <span className="assl-label">Próximo vencimento</span>
                <span className="assl-value" style={{color: data.daysLeft !== null && data.daysLeft <= 5 ? "#D97706" : "#1E293B"}}>
                  {formatDate(data.planExpiresAt)}
                </span>
              </div>
              {data.planExpiresAt && data.paidAt && (() => {
                const total = new Date(data.planExpiresAt).getTime() - new Date(data.paidAt).getTime();
                const elapsed = Date.now() - new Date(data.paidAt).getTime();
                const pct = Math.min(100, Math.max(0, (elapsed / total) * 100));
                const barColor = pct > 90 ? "#DC2626" : pct > 70 ? "#D97706" : "#4F8EF7";
                return (
                  <>
                    <div className="assl-progress-bar">
                      <div className="assl-progress-fill" style={{width:`${pct}%`, background: barColor}}></div>
                    </div>
                    <div className="assl-progress-label">
                      <span>Início: {formatDate(data.paidAt)}</span>
                      <span>{data.daysLeft !== null && data.daysLeft > 0 ? `${data.daysLeft} dias restantes` : "Vencido"}</span>
                    </div>
                  </>
                );
              })()}
            </div>

            <div className="assl-card">
              <div className="assl-card-title">Ações</div>
              <a href="/assinar" className="assl-btn">
                {data.isPaid ? "🔄 Renovar Assinatura" : "🔓 Reativar Acesso"}
              </a>
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="assl-btn assl-btn-wpp">
                💬 Falar com Suporte
              </a>
              {data.isPaid && !cancelMsg && (
                <>
                  <button className="assl-btn assl-btn-cancel" onClick={() => setShowConfirm(true)}>
                    ❌ Cancelar Assinatura
                  </button>
                  <p className="assl-cancel-note">
                    ⚠️ O primeiro pagamento não é reembolsável. Ao cancelar, você mantém o acesso até o fim do período pago.
                  </p>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}