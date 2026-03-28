"use client";
import { useEffect, useState } from "react";

type Appointment = {
  id: string;
  date: string;
  status: string;
  client: { name: string; phone: string | null; };
  vehicle: { brand: string; model: string; plate: string | null; };
  service: { name: string; price: number; };
};

export default function DashboardPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

const [trialTimeLeft, setTrialTimeLeft] = useState<{days: number; hours: number; minutes: number; seconds: number} | null>(null);
  const [planType, setPlanType] = useState<string | null>(null);
  const [planExpiresAt, setPlanExpiresAt] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/assinatura")
      .then(r => r.json())
      .then(d => {
        setPlanType(d.planType);
        setPlanExpiresAt(d.planExpiresAt);
      });
  }, []);

  useEffect(() => {
    if (planType !== "trial" || !planExpiresAt) return;
    const update = () => {
      const diff = new Date(planExpiresAt).getTime() - Date.now();
      if (diff <= 0) { setTrialTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 }); return; }
      setTrialTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [planType, planExpiresAt]);

  {planType === "trial" && trialTimeLeft && (
        <div style={{background:"linear-gradient(135deg,#1E293B 0%,#0F172A 100%)", borderRadius:16, padding:"20px 24px", marginBottom:24, border:"1px solid #F59E0B", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:16}}>
          <div>
            <div style={{fontSize:13, fontWeight:700, color:"#F59E0B", marginBottom:4}}>🎁 MODO TESTE GRATUITO</div>
            <div style={{fontSize:15, color:"#fff", fontWeight:600}}>Seu período gratuito termina em:</div>
          </div>
          <div style={{display:"flex", gap:12}}>
            {[
              {val: trialTimeLeft.days, label: "dias"},
              {val: trialTimeLeft.hours, label: "horas"},
              {val: trialTimeLeft.minutes, label: "min"},
              {val: trialTimeLeft.seconds, label: "seg"},
            ].map((t, i) => (
              <div key={i} style={{background:"rgba(245,158,11,0.15)", border:"1px solid rgba(245,158,11,0.3)", borderRadius:10, padding:"10px 14px", textAlign:"center", minWidth:56}}>
                <div style={{fontSize:22, fontWeight:800, color:"#F59E0B", lineHeight:1}}>{String(t.val).padStart(2,"0")}</div>
                <div style={{fontSize:10, color:"#94A3B8", marginTop:4, fontWeight:600, textTransform:"uppercase"}}>{t.label}</div>
              </div>
            ))}
          </div>
          <a href="/assinatura" style={{background:"#F59E0B", color:"#1E293B", padding:"10px 20px", borderRadius:10, fontWeight:700, fontSize:14, textDecoration:"none", whiteSpace:"nowrap"}}>
            ⭐ Assinar agora
          </a>
        </div>
      )}

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    fetch(`/api/agendamentos?date=${today}`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setAppointments(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const nextAppointment = appointments
    .filter(a => a.status !== "completed" && a.status !== "cancelled")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  const inProgress = appointments.filter(a => a.status === "in_progress").length;
  const todayTotal = appointments.length;

  const statusLabel: Record<string, { label: string; color: string; bg: string }> = {
    pending: { label: "Pendente", color: "#D97706", bg: "#FFFBEB" },
    confirmed: { label: "Confirmado", color: "#16A34A", bg: "#F0FDF4" },
    in_progress: { label: "Em andamento", color: "#4F8EF7", bg: "#EFF6FF" },
    completed: { label: "Concluído", color: "#64748B", bg: "#F8FAFC" },
    cancelled: { label: "Cancelado", color: "#DC2626", bg: "#FEF2F2" },
  };

  return (
    <>
      <style>{`
        .dash-title { font-size: 24px; font-weight: 700; color: #1E293B; margin-bottom: 4px; }
        .dash-sub { font-size: 14px; color: #64748B; margin-bottom: 32px; }
        .dash-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 32px; }
        .dash-card { background: #fff; border-radius: 16px; padding: 24px; border: 1px solid #E2E8F0; box-shadow: 0 2px 8px rgba(0,0,0,0.04); display: flex; align-items: center; gap: 16px; }
        .dash-card-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0; }
        .dash-card-val { font-size: 28px; font-weight: 800; color: #1E293B; line-height: 1; }
        .dash-card-label { font-size: 13px; color: #64748B; margin-top: 4px; }
        .dash-section { background: #fff; border-radius: 16px; border: 1px solid #E2E8F0; padding: 24px; margin-bottom: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
        .dash-section-title { font-size: 16px; font-weight: 700; color: #1E293B; margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between; }
        .dash-empty { text-align: center; padding: 32px; color: #94A3B8; font-size: 14px; }
        .appt-row { display: flex; align-items: center; gap: 16px; padding: 14px 0; border-bottom: 1px solid #F1F5F9; }
        .appt-row:last-child { border-bottom: none; padding-bottom: 0; }
        .appt-time { font-size: 16px; font-weight: 800; color: #1E293B; min-width: 52px; }
        .appt-name { font-size: 14px; font-weight: 700; color: #1E293B; }
        .appt-sub { font-size: 12px; color: #64748B; margin-top: 2px; }
        .status-badge { padding: 3px 10px; border-radius: 100px; font-size: 11px; font-weight: 600; margin-left: auto; }
        .btn-primary { background: #4F8EF7; color: #fff; border: none; padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; text-decoration: none; display: inline-block; font-family: inherit; }
        .btn-wpp { background: #25D366; color: #fff; border: none; padding: 6px 12px; border-radius: 8px; font-size: 12px; font-weight: 600; cursor: pointer; font-family: inherit; margin-left: 8px; }
        @media (max-width: 768px) { .dash-cards { grid-template-columns: 1fr; } }
      `}</style>

      <div className="dash-title">📊 Dashboard</div>
      <div className="dash-sub">
        {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
      </div>

      <div className="dash-cards">
        <div className="dash-card">
          <div className="dash-card-icon" style={{background:"#EFF6FF"}}>📅</div>
          <div>
            <div className="dash-card-val">{loading ? "—" : todayTotal}</div>
            <div className="dash-card-label">Agendamentos Hoje</div>
          </div>
        </div>
        <div className="dash-card">
          <div className="dash-card-icon" style={{background:"#F0FDF4"}}>🕐</div>
          <div>
            <div className="dash-card-val">
              {loading ? "—" : nextAppointment
                ? new Date(nextAppointment.date).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
                : "—"}
            </div>
            <div className="dash-card-label">Próximo Horário</div>
          </div>
        </div>
        <div className="dash-card">
          <div className="dash-card-icon" style={{background:"#FFF7ED"}}>🚗</div>
          <div>
            <div className="dash-card-val">{loading ? "—" : inProgress}</div>
            <div className="dash-card-label">Veículos em Serviço</div>
          </div>
        </div>
      </div>

      <div className="dash-section">
        <div className="dash-section-title">
          <span>Agenda do Dia</span>
          <a href="/agenda" className="btn-primary">+ Novo Agendamento</a>
        </div>
        {loading ? (
          <div className="dash-empty">Carregando...</div>
        ) : appointments.length === 0 ? (
          <div className="dash-empty">
            Nenhum agendamento para hoje.<br />
            <a href="/agenda" style={{color:"#4F8EF7", textDecoration:"none", fontWeight:600}}>Criar agendamento →</a>
          </div>
        ) : (
          appointments.map(appt => {
            const st = statusLabel[appt.status] || statusLabel.pending;
            const apptDate = new Date(appt.date);
            return (
              <div key={appt.id} className="appt-row">
                <div className="appt-time">
                  {apptDate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                </div>
                <div style={{flex:1}}>
                  <div className="appt-name">{appt.client.name}</div>
                  <div className="appt-sub">🚗 {appt.vehicle.brand} {appt.vehicle.model} · ✨ {appt.service.name}</div>
                </div>
                <span className="status-badge" style={{color: st.color, background: st.bg}}>{st.label}</span>
                {appt.client.phone && (
                  <button className="btn-wpp" onClick={() => {
                    const phone = appt.client.phone!.replace(/\D/g, "");
                    const msg = encodeURIComponent(`Olá ${appt.client.name}! Confirmando seu agendamento às ${apptDate.toLocaleTimeString("pt-BR", {hour:"2-digit",minute:"2-digit"})} para ${appt.service.name}. Te esperamos! 🚗`);
                    window.open(`https://wa.me/55${phone}?text=${msg}`, "_blank");
                  }}>💬</button>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="dash-section">
        <div className="dash-section-title">
          <span>Acesso Rápido</span>
        </div>
        <div style={{display:"flex", gap:12, flexWrap:"wrap"}}>
          <a href="/agenda" className="btn-primary" style={{textDecoration:"none"}}>📅 Agenda</a>
          <a href="/clientes" className="btn-primary" style={{textDecoration:"none", background:"#1E293B"}}>👤 Clientes</a>
          <a href="/servicos" className="btn-primary" style={{textDecoration:"none", background:"#16A34A"}}>🚗 Serviços</a>
        </div>
      </div>
    </>
  );
}