"use client";
import { useEffect, useState } from "react";

type Client = { id: string; name: string; phone: string | null; vehicles: Vehicle[]; };
type Vehicle = { id: string; brand: string; model: string; plate: string | null; };
type Service = { id: string; name: string; price: number; duration: number; };
type Appointment = {
  id: string;
  date: string;
  status: string;
  notes: string | null;
  client: Client;
  vehicle: Vehicle;
  service: Service;
};

export default function AgendaPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [clientId, setClientId] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState("09:00");
  const [notes, setNotes] = useState("");

  const selectedClient = clients.find(c => c.id === clientId);

  const loadAppointments = async () => {
    const res = await fetch(`/api/agendamentos?date=${selectedDate}`);
    const data = await res.json();
    if (Array.isArray(data)) setAppointments(data);
  };

  const loadClients = async () => {
    const res = await fetch("/api/clientes");
    const data = await res.json();
    if (Array.isArray(data)) setClients(data);
  };

  const loadServices = async () => {
    const res = await fetch("/api/servicos");
    const data = await res.json();
    if (Array.isArray(data)) setServices(data);
  };

  useEffect(() => { loadClients(); loadServices(); }, []);
  useEffect(() => { loadAppointments(); }, [selectedDate]);

  const handleAdd = async () => {
    if (!clientId || !vehicleId || !serviceId || !date || !time) {
      setMessage("⚠️ Preencha todos os campos obrigatórios!");
      return;
    }
    setLoading(true);
    const dateTime = new Date(`${date}T${time}:00`);
    await fetch("/api/agendamentos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId, vehicleId, serviceId, date: dateTime, notes }),
    });
    setClientId(""); setVehicleId(""); setServiceId("");
    setNotes(""); setShowForm(false);
    setMessage("✅ Agendamento criado!");
    setLoading(false);
    loadAppointments();
    setTimeout(() => setMessage(""), 3000);
  };

  const handleStatus = async (id: string, status: string) => {
    await fetch("/api/agendamentos", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    loadAppointments();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este agendamento?")) return;
    await fetch(`/api/agendamentos?id=${id}`, { method: "DELETE" });
    loadAppointments();
  };

  const handleWhatsApp = (appt: Appointment) => {
    if (!appt.client.phone) return alert("Cliente sem telefone cadastrado!");
    const phone = appt.client.phone.replace(/\D/g, "");
    const date = new Date(appt.date);
    const msg = encodeURIComponent(
      `Olá ${appt.client.name}! 👋\n\nSeu agendamento foi confirmado:\n\n` +
      `📅 Data: ${date.toLocaleDateString("pt-BR")}\n` +
      `🕐 Horário: ${date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}\n` +
      `🚗 Veículo: ${appt.vehicle.brand} ${appt.vehicle.model}${appt.vehicle.plate ? ` - ${appt.vehicle.plate}` : ""}\n` +
      `✨ Serviço: ${appt.service.name}\n\n` +
      `Te esperamos! 😊`
    );
    window.open(`https://wa.me/55${phone}?text=${msg}`, "_blank");
  };

  const statusLabel: Record<string, {label: string; color: string; bg: string}> = {
    pending: { label: "Pendente", color: "#D97706", bg: "#FFFBEB" },
    confirmed: { label: "Confirmado", color: "#16A34A", bg: "#F0FDF4" },
    in_progress: { label: "Em andamento", color: "#4F8EF7", bg: "#EFF6FF" },
    completed: { label: "Concluído", color: "#64748B", bg: "#F8FAFC" },
    cancelled: { label: "Cancelado", color: "#DC2626", bg: "#FEF2F2" },
  };

  const hours = Array.from({length: 24}, (_, i) => `${String(i).padStart(2,"0")}:00`);

  return (
    <>
      <style>{`
        .page-title { font-size: 24px; font-weight: 700; color: #1E293B; margin-bottom: 4px; }
        .page-sub { font-size: 14px; color: #64748B; margin-bottom: 24px; }
        .toolbar { display: flex; gap: 12px; margin-bottom: 20px; align-items: center; flex-wrap: wrap; }
        .date-input { padding: 10px 14px; border: 1.5px solid #E2E8F0; border-radius: 10px; font-size: 14px; font-family: inherit; outline: none; background: #fff; }
        .date-input:focus { border-color: #4F8EF7; }
        .btn-primary { background: #4F8EF7; color: #fff; border: none; padding: 10px 20px; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: inherit; white-space: nowrap; }
        .btn-primary:hover { background: #2563EB; }
        .btn-secondary { background: #F1F5F9; color: #475569; border: none; padding: 10px 20px; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: inherit; }
        .btn-wpp { background: #25D366; color: #fff; border: none; padding: 8px 14px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; }
        .btn-danger { background: #FEF2F2; color: #DC2626; border: none; padding: 7px 12px; border-radius: 8px; font-size: 13px; cursor: pointer; font-family: inherit; }
        .form-card { background: #fff; border-radius: 16px; border: 1px solid #E2E8F0; padding: 28px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
        .form-title { font-size: 16px; font-weight: 700; color: #1E293B; margin-bottom: 20px; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
        .form-full { grid-column: 1 / -1; }
        .form-label { font-size: 13px; font-weight: 600; color: #475569; display: block; margin-bottom: 6px; }
        .form-input { width: 100%; padding: 10px 14px; border: 1.5px solid #E2E8F0; border-radius: 10px; font-size: 14px; font-family: inherit; outline: none; background: #F8FAFC; }
        .form-input:focus { border-color: #4F8EF7; background: #fff; }
        .form-actions { display: flex; gap: 10px; }
        .appt-card { background: #fff; border-radius: 16px; border: 1px solid #E2E8F0; padding: 20px; margin-bottom: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); display: flex; align-items: center; gap: 16px; }
        .appt-time { font-size: 20px; font-weight: 800; color: #1E293B; min-width: 56px; }
        .appt-info { flex: 1; }
        .appt-name { font-size: 15px; font-weight: 700; color: #1E293B; margin-bottom: 2px; }
        .appt-sub { font-size: 13px; color: #64748B; margin-bottom: 6px; }
        .appt-service { font-size: 13px; font-weight: 600; color: #4F8EF7; }
        .appt-actions { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
        .status-badge { padding: 4px 12px; border-radius: 100px; font-size: 12px; font-weight: 600; }
        .status-select { padding: 6px 10px; border: 1.5px solid #E2E8F0; border-radius: 8px; font-size: 12px; font-family: inherit; outline: none; cursor: pointer; }
        .message { font-size: 14px; font-weight: 600; margin-bottom: 16px; padding: 10px 14px; border-radius: 8px; background: #F0FDF4; color: #16A34A; }
        .empty { text-align: center; padding: 60px 20px; color: #94A3B8; font-size: 14px; background: #fff; border-radius: 16px; border: 1px solid #E2E8F0; }
        @media (max-width: 768px) { .form-grid { grid-template-columns: 1fr; } .appt-card { flex-direction: column; align-items: flex-start; } }
      `}</style>

      <div className="page-title">📅 Agenda</div>
      <div className="page-sub">Gerencie os agendamentos da sua estética</div>

      {message && <div className="message">{message}</div>}

      <div className="toolbar">
        <input
          type="date"
          className="date-input"
          value={selectedDate}
          onChange={e => setSelectedDate(e.target.value)}
        />
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          + Novo Agendamento
        </button>
      </div>

      {showForm && (
        <div className="form-card">
          <div className="form-title">Novo Agendamento</div>
          <div className="form-grid">
            <div>
              <label className="form-label">Cliente *</label>
              <select className="form-input" value={clientId} onChange={e => { setClientId(e.target.value); setVehicleId(""); }}>
                <option value="">Selecione o cliente</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Veículo *</label>
              <select className="form-input" value={vehicleId} onChange={e => setVehicleId(e.target.value)} disabled={!clientId}>
                <option value="">Selecione o veículo</option>
                {selectedClient?.vehicles.map(v => (
                  <option key={v.id} value={v.id}>{v.brand} {v.model} {v.plate ? `- ${v.plate}` : ""}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Serviço *</label>
              <select className="form-input" value={serviceId} onChange={e => setServiceId(e.target.value)}>
                <option value="">Selecione o serviço</option>
                {services.map(s => <option key={s.id} value={s.id}>{s.name} — R$ {s.price.toFixed(2)}</option>)}
              </select>
            </div>
            <div style={{display:"flex", gap:8}}>
              <div style={{flex:1}}>
                <label className="form-label">Data *</label>
                <input type="date" className="form-input" value={date} onChange={e => setDate(e.target.value)} />
              </div>
              <div style={{flex:1}}>
                <label className="form-label">Horário *</label>
                <select className="form-input" value={time} onChange={e => setTime(e.target.value)}>
                  {Array.from({length: 28}, (_, i) => {
                    const h = Math.floor((i * 30 + 7 * 60) / 60);
                    const m = (i * 30 + 7 * 60) % 60;
                    return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`;
                  }).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div className="form-full">
              <label className="form-label">Observações</label>
              <input className="form-input" placeholder="Observações opcionais..." value={notes} onChange={e => setNotes(e.target.value)} />
            </div>
          </div>
          <div className="form-actions">
            <button className="btn-primary" onClick={handleAdd} disabled={loading}>
              {loading ? "Salvando..." : "💾 Salvar Agendamento"}
            </button>
            <button className="btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
          </div>
        </div>
      )}

      {appointments.length === 0 ? (
        <div className="empty">
          Nenhum agendamento para esta data.<br />
          <span style={{color:"#4F8EF7", cursor:"pointer", fontWeight:600}} onClick={() => setShowForm(true)}>
            Criar agendamento →
          </span>
        </div>
      ) : (
        appointments.map(appt => {
          const st = statusLabel[appt.status] || statusLabel.pending;
          const apptDate = new Date(appt.date);
          return (
            <div key={appt.id} className="appt-card">
              <div className="appt-time">
                {apptDate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
              </div>
              <div className="appt-info">
                <div className="appt-name">{appt.client.name}</div>
                <div className="appt-sub">🚗 {appt.vehicle.brand} {appt.vehicle.model}{appt.vehicle.plate ? ` — ${appt.vehicle.plate}` : ""}</div>
                <div className="appt-service">✨ {appt.service.name} — R$ {appt.service.price.toFixed(2)}</div>
                {appt.notes && <div style={{fontSize:12, color:"#94A3B8", marginTop:4}}>📝 {appt.notes}</div>}
              </div>
              <div className="appt-actions">
                <span className="status-badge" style={{color: st.color, background: st.bg}}>{st.label}</span>
                <select
                  className="status-select"
                  value={appt.status}
                  onChange={e => handleStatus(appt.id, e.target.value)}
                >
                  <option value="pending">Pendente</option>
                  <option value="confirmed">Confirmado</option>
                  <option value="in_progress">Em andamento</option>
                  <option value="completed">Concluído</option>
                  <option value="cancelled">Cancelado</option>
                </select>
                <button className="btn-wpp" onClick={() => handleWhatsApp(appt)}>💬 WhatsApp</button>
                <button className="btn-danger" onClick={() => handleDelete(appt.id)}>🗑️</button>
              </div>
            </div>
          );
        })
      )}
    </>
  );
}