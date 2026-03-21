"use client";
import { useEffect, useState } from "react";

type Vehicle = {
  id: string;
  brand: string;
  model: string;
  year: number | null;
  plate: string | null;
  color: string | null;
};

type Client = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  cpf: string | null;
  vehicles: Vehicle[];
};

export default function ClientesPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Client | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");

  const loadClients = async () => {
    const res = await fetch("/api/clientes");
    const data = await res.json();
    if (Array.isArray(data)) setClients(data);
  };

  useEffect(() => { loadClients(); }, []);

  const filtered = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  );

  const handleAdd = async () => {
    if (!name) { setMessage("⚠️ Nome é obrigatório!"); return; }
    setLoading(true);
    await fetch("/api/clientes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone, email, cpf }),
    });
    setName(""); setPhone(""); setEmail(""); setCpf("");
    setShowForm(false);
    setMessage("✅ Cliente cadastrado!");
    setLoading(false);
    loadClients();
    setTimeout(() => setMessage(""), 3000);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este cliente?")) return;
    await fetch(`/api/clientes?id=${id}`, { method: "DELETE" });
    setSelected(null);
    loadClients();
  };

  return (
    <>
      <style>{`
        .page-title { font-size: 24px; font-weight: 700; color: #1E293B; margin-bottom: 4px; }
        .page-sub { font-size: 14px; color: #64748B; margin-bottom: 24px; }
        .toolbar { display: flex; gap: 12px; margin-bottom: 20px; align-items: center; }
        .search-input { flex: 1; padding: 10px 14px; border: 1.5px solid #E2E8F0; border-radius: 10px; font-size: 14px; font-family: inherit; outline: none; background: #fff; }
        .search-input:focus { border-color: #4F8EF7; }
        .btn-primary { background: #4F8EF7; color: #fff; border: none; padding: 10px 20px; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: inherit; white-space: nowrap; }
        .btn-primary:hover { background: #2563EB; }
        .btn-danger { background: #FEF2F2; color: #DC2626; border: 1px solid #FECACA; padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .card { background: #fff; border-radius: 16px; border: 1px solid #E2E8F0; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); cursor: pointer; transition: border-color 0.2s, box-shadow 0.2s; }
        .card:hover { border-color: #4F8EF7; box-shadow: 0 4px 20px rgba(79,142,247,0.12); }
        .card.active { border-color: #4F8EF7; box-shadow: 0 4px 20px rgba(79,142,247,0.15); }
        .client-name { font-size: 16px; font-weight: 700; color: #1E293B; margin-bottom: 6px; }
        .client-info { font-size: 13px; color: #64748B; margin-bottom: 2px; }
        .vehicle-tag { display: inline-flex; align-items: center; gap: 4px; background: #EFF6FF; color: #4F8EF7; padding: 3px 10px; border-radius: 100px; font-size: 12px; font-weight: 600; margin-top: 8px; margin-right: 4px; }
        .detail-panel { background: #fff; border-radius: 16px; border: 1px solid #E2E8F0; padding: 28px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
        .detail-title { font-size: 18px; font-weight: 700; color: #1E293B; margin-bottom: 16px; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #F1F5F9; font-size: 14px; }
        .detail-row:last-child { border-bottom: none; }
        .detail-label { color: #64748B; }
        .detail-value { font-weight: 600; color: #1E293B; }
        .form-card { background: #fff; border-radius: 16px; border: 1px solid #E2E8F0; padding: 28px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
        .form-title { font-size: 16px; font-weight: 700; color: #1E293B; margin-bottom: 20px; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
        .form-label { font-size: 13px; font-weight: 600; color: #475569; display: block; margin-bottom: 6px; }
        .form-input { width: 100%; padding: 10px 14px; border: 1.5px solid #E2E8F0; border-radius: 10px; font-size: 14px; font-family: inherit; outline: none; background: #F8FAFC; }
        .form-input:focus { border-color: #4F8EF7; background: #fff; }
        .form-actions { display: flex; gap: 10px; }
        .btn-secondary { background: #F1F5F9; color: #475569; border: none; padding: 10px 20px; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: inherit; }
        .message { font-size: 14px; font-weight: 600; margin-bottom: 16px; padding: 10px 14px; border-radius: 8px; background: #F0FDF4; color: #16A34A; }
        .empty { text-align: center; padding: 60px 20px; color: #94A3B8; font-size: 14px; }
        @media (max-width: 768px) { .grid { grid-template-columns: 1fr; } .form-grid { grid-template-columns: 1fr; } }
      `}</style>

      <div className="page-title">👤 Clientes</div>
      <div className="page-sub">Gerencie seus clientes e veículos</div>

      {message && <div className="message">{message}</div>}

      <div className="toolbar">
        <input
          className="search-input"
          placeholder="🔍 Buscar cliente por nome ou telefone..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          + Novo Cliente
        </button>
      </div>

      {showForm && (
        <div className="form-card">
          <div className="form-title">Novo Cliente</div>
          <div className="form-grid">
            <div>
              <label className="form-label">Nome *</label>
              <input className="form-input" placeholder="Nome completo" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div>
              <label className="form-label">Telefone</label>
              <input className="form-input" placeholder="(11) 99999-9999" value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
            <div>
              <label className="form-label">E-mail</label>
              <input className="form-input" placeholder="email@exemplo.com" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="form-label">CPF</label>
              <input className="form-input" placeholder="000.000.000-00" value={cpf} onChange={e => setCpf(e.target.value)} />
            </div>
          </div>
          <div className="form-actions">
            <button className="btn-primary" onClick={handleAdd} disabled={loading}>
              {loading ? "Salvando..." : "💾 Salvar Cliente"}
            </button>
            <button className="btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="empty">
          Nenhum cliente cadastrado ainda.<br />
          <span style={{color:"#4F8EF7", cursor:"pointer", fontWeight:600}} onClick={() => setShowForm(true)}>
            Cadastrar primeiro cliente →
          </span>
        </div>
      ) : (
        <div className="grid">
          <div>
            {filtered.map(c => (
              <div
                key={c.id}
                className={`card ${selected?.id === c.id ? "active" : ""}`}
                style={{marginBottom:12}}
                onClick={() => setSelected(c)}
              >
                <div className="client-name">{c.name}</div>
                {c.phone && <div className="client-info">📱 {c.phone}</div>}
                {c.email && <div className="client-info">✉️ {c.email}</div>}
                {c.vehicles.map(v => (
                  <span key={v.id} className="vehicle-tag">🚗 {v.brand} {v.model} {v.plate ? `— ${v.plate}` : ""}</span>
                ))}
              </div>
            ))}
          </div>

          {selected && (
            <div className="detail-panel">
              <div className="detail-title">{selected.name}</div>
              <div className="detail-row"><span className="detail-label">Telefone</span><span className="detail-value">{selected.phone || "—"}</span></div>
              <div className="detail-row"><span className="detail-label">E-mail</span><span className="detail-value">{selected.email || "—"}</span></div>
              <div className="detail-row"><span className="detail-label">CPF</span><span className="detail-value">{selected.cpf || "—"}</span></div>
              <div className="detail-row"><span className="detail-label">Veículos</span><span className="detail-value">{selected.vehicles.length}</span></div>
              <div style={{marginTop:20, display:"flex", gap:10}}>
                <a href={`/clientes/${selected.id}`} className="btn-primary" style={{textDecoration:"none", fontSize:13}}>
                  🚗 Gerenciar Veículos
                </a>
                <button className="btn-danger" onClick={() => handleDelete(selected.id)}>
                  🗑️ Excluir
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}