"use client";
import { useEffect, useState } from "react";

export default function WhatsAppConfigPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reconnecting, setReconnecting] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/whatsapp-config");
      const json = await res.json();
      setData(json);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    fetchStatus();
    // Atualiza status a cada 10 segundos
    const interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleReconnect = async () => {
    setReconnecting(true);
    try {
      const res = await fetch("/api/whatsapp-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reconnect" }),
      });
      const json = await res.json();
      setData((prev: any) => ({ ...prev, qrcode: json.qrcode, status: "disconnected" }));
    } catch {}
    setReconnecting(false);
  };

  return (
    <>
      <style>{`
        .wpp-wrapper { max-width: 680px; margin: 0 auto; padding: 8px 0 40px; }
        .wpp-title { font-size: 24px; font-weight: 700; color: #1E293B; margin-bottom: 4px; }
        .wpp-sub { font-size: 14px; color: #64748B; margin-bottom: 32px; }
        .wpp-card { background: #fff; border-radius: 16px; border: 1px solid #E2E8F0; padding: 28px; margin-bottom: 16px; box-shadow: 0 2px 12px rgba(0,0,0,0.04); }
        .wpp-card-title { font-size: 13px; font-weight: 700; color: #94A3B8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 20px; }
        .wpp-status-connected { display: inline-flex; align-items: center; gap: 8px; background: #F0FDF4; border: 1px solid #BBF7D0; color: #16A34A; padding: 8px 16px; border-radius: 100px; font-size: 14px; font-weight: 700; }
        .wpp-status-disconnected { display: inline-flex; align-items: center; gap: 8px; background: #FEF2F2; border: 1px solid #FECACA; color: #DC2626; padding: 8px 16px; border-radius: 100px; font-size: 14px; font-weight: 700; }
        .wpp-dot-green { width: 8px; height: 8px; border-radius: 50%; background: #16A34A; animation: pulse-green 2s infinite; }
        .wpp-dot-red { width: 8px; height: 8px; border-radius: 50%; background: #DC2626; }
        @keyframes pulse-green { 0%, 100% { box-shadow: 0 0 0 0 rgba(22,163,74,0.4); } 50% { box-shadow: 0 0 0 6px rgba(22,163,74,0); } }
        .wpp-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #F1F5F9; }
        .wpp-row:last-child { border-bottom: none; }
        .wpp-label { font-size: 14px; color: #64748B; }
        .wpp-value { font-size: 14px; font-weight: 600; color: #1E293B; }
        .wpp-qr-box { display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 24px; background: #F8FAFC; border-radius: 12px; border: 2px dashed #E2E8F0; }
        .wpp-qr-img { width: 220px; height: 220px; border-radius: 8px; }
        .wpp-qr-instructions { font-size: 13px; color: #64748B; text-align: center; line-height: 1.7; }
        .wpp-qr-instructions strong { color: #1E293B; }
        .wpp-btn { display: block; width: 100%; padding: 14px; background: #4F8EF7; color: #fff; border: none; border-radius: 10px; font-size: 15px; font-weight: 700; cursor: pointer; text-align: center; transition: background 0.2s; font-family: inherit; margin-top: 16px; }
        .wpp-btn:hover { background: #2563EB; }
        .wpp-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .wpp-btn-outline { background: #fff; color: #4F8EF7; border: 1.5px solid #4F8EF7; }
        .wpp-btn-outline:hover { background: #EFF6FF; }
        .wpp-premium-badge { display: inline-flex; align-items: center; gap: 6px; background: linear-gradient(90deg,rgba(245,158,11,0.15),rgba(239,68,68,0.1)); border: 1px solid rgba(245,158,11,0.4); color: #F59E0B; padding: 4px 12px; border-radius: 100px; font-size: 12px; font-weight: 700; margin-bottom: 16px; }
        .wpp-info-box { background: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 12px; padding: 16px; font-size: 13px; color: #1D4ED8; line-height: 1.7; margin-top: 16px; }
        .wpp-skeleton { background: linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%); background-size: 200% 100%; animation: shimmer 1.2s infinite; border-radius: 8px; height: 18px; }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
      `}</style>

      <div className="wpp-wrapper">
        <div className="wpp-title">📱 WhatsApp</div>
        <div className="wpp-sub">Configure e gerencie o WhatsApp integrado da sua estética</div>

        {loading ? (
          <div className="wpp-card">
            <div className="wpp-skeleton" style={{width:"40%", marginBottom:20}}></div>
            <div className="wpp-skeleton" style={{marginBottom:12}}></div>
            <div className="wpp-skeleton" style={{width:"70%"}}></div>
          </div>
        ) : data?.error === "Acesso restrito ao plano Premium" ? (
          <div className="wpp-card" style={{textAlign:"center"}}>
            <div style={{fontSize:48, marginBottom:16}}>⭐</div>
            <div style={{fontSize:18, fontWeight:700, color:"#1E293B", marginBottom:8}}>Recurso exclusivo Premium</div>
            <div style={{fontSize:14, color:"#64748B", marginBottom:24}}>Faça upgrade para o plano Premium e tenha WhatsApp integrado na sua estética!</div>
            <a href="/assinar?plano=premium" style={{display:"inline-block", padding:"14px 32px", background:"linear-gradient(90deg,#F59E0B,#EF4444)", color:"#fff", borderRadius:10, fontWeight:700, textDecoration:"none", fontSize:15}}>
              ⭐ Fazer Upgrade
            </a>
          </div>
        ) : (
          <>
            {/* Status */}
            <div className="wpp-card">
              <div className="wpp-card-title">Status da Conexão</div>
              <div className="wpp-premium-badge">⭐ Plano Premium</div>
              <div style={{marginBottom:20}}>
                {data?.status === "connected" ? (
                  <div className="wpp-status-connected">
                    <div className="wpp-dot-green"></div>
                    WhatsApp Conectado
                  </div>
                ) : (
                  <div className="wpp-status-disconnected">
                    <div className="wpp-dot-red"></div>
                    WhatsApp Desconectado
                  </div>
                )}
              </div>
              <div className="wpp-row">
                <span className="wpp-label">Instância</span>
                <span className="wpp-value" style={{fontFamily:"monospace", fontSize:12}}>{data?.instance || "—"}</span>
              </div>
              <div className="wpp-row">
                <span className="wpp-label">Número conectado</span>
                <span className="wpp-value">{data?.phone ? `(${data.phone.slice(0,2)}) ${data.phone.slice(2,7)}-${data.phone.slice(7)}` : "—"}</span>
              </div>

              {data?.status === "connected" && (
                <div className="wpp-info-box">
                  ✅ Seu WhatsApp está conectado e funcionando! Os clientes podem agendar serviços enviando mensagem para o número conectado.
                </div>
              )}

              <button className="wpp-btn wpp-btn-outline" onClick={handleReconnect} disabled={reconnecting} style={{marginTop:20}}>
                {reconnecting ? "Gerando QR Code..." : "🔄 Reconectar WhatsApp"}
              </button>
            </div>

            {/* QR Code */}
            {data?.status === "disconnected" && data?.qrcode && (
              <div className="wpp-card">
                <div className="wpp-card-title">Conectar WhatsApp</div>
                <div className="wpp-qr-box">
                  <img src={data.qrcode} alt="QR Code WhatsApp" className="wpp-qr-img" />
                  <div className="wpp-qr-instructions">
                    <strong>Como conectar:</strong><br />
                    1. Abra o WhatsApp no celular<br />
                    2. Toque em <strong>Configurações → Dispositivos conectados</strong><br />
                    3. Toque em <strong>Conectar dispositivo</strong><br />
                    4. Aponte a câmera para o QR Code acima
                  </div>
                </div>
                <div className="wpp-info-box" style={{background:"#FFFBEB", borderColor:"#FDE68A", color:"#92400E"}}>
                  ⚠️ O QR Code expira em 60 segundos. Se expirar, clique em <strong>Reconectar WhatsApp</strong> para gerar um novo.
                </div>
              </div>
            )}

            {/* Como usar */}
            <div className="wpp-card">
              <div className="wpp-card-title">Como Funciona</div>
              {[
                { icon:"📅", title:"Agendamento automático", text:"Clientes podem agendar serviços enviando mensagem para o número conectado. O sistema responde automaticamente com o menu de serviços." },
                { icon:"✅", title:"Confirmações automáticas", text:"Quando você confirma, conclui ou cancela um agendamento, o cliente recebe uma notificação automática no WhatsApp." },
                { icon:"🔔", title:"Notificações para você", text:"Você recebe uma notificação sempre que um novo agendamento for feito via WhatsApp." },
                { icon:"🔑", title:"Acesso dos clientes", text:"Quando um cliente paga o plano, ele recebe login e senha automaticamente via WhatsApp." },
              ].map((item, i) => (
                <div key={i} className="wpp-row" style={{alignItems:"flex-start", gap:16}}>
                  <div style={{fontSize:24, flexShrink:0}}>{item.icon}</div>
                  <div>
                    <div style={{fontSize:14, fontWeight:700, color:"#1E293B", marginBottom:4}}>{item.title}</div>
                    <div style={{fontSize:13, color:"#64748B", lineHeight:1.6}}>{item.text}</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}