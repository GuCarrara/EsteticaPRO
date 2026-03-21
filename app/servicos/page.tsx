"use client";
import { useEffect, useState } from "react";

type Service = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration: number;
};

export default function ServicosPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("60");

  const loadServices = async () => {
    const res = await fetch("/api/servicos");
    const data = await res.json();
    if (Array.isArray(data)) setServices(data);
  };

  useEffect(() => { loadServices(); }, []);

  const resetForm = () => {
    setName(""); setDescription(""); setPrice(""); setDuration("60");
    setEditingId(null); setShowForm(false);
  };

  const handleSave = async () => {
    if (!name || !price) { setMessage("⚠️ Nome e preço são obrigatórios!"); return; }
    setLoading(true);

    if (editingId) {
      await fetch("/api/servicos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId, name, description, price, duration }),
      });
      setMessage("✅ Serviço atualizado!");
    } else {
      await fetch("/api/servicos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, price, duration }),
      });
      setMessage("✅ Serviço cadastrado!");
    }

    resetForm();
    setLoading(false);
    loadServices();
    setTimeout(() => setMessage(""), 3000);
  };

  const handleEdit = (s: Service) => {
    setName(s.name);
    setDescription(s.description || "");
    setPrice(String(s.price));
    setDuration(String(s.duration));
    setEditingId(s.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Excluir este serviço?")) return;
    await fetch(`/api/servicos?id=${id}`, { method: "DELETE" });
    loadServices();
  };

  return (
    <>
      <style>{`
        .page-title { font-size: 24px; font-weight: 700; color: #1E293B; margin-bottom: 4px; }
        .page-sub { font-size: 14px; color: #64748B; margin-bottom: 24px; }
        .toolbar { display: flex; justify-content: flex-end; margin-bottom: 20px; }
        .btn-primary { background: #4F8EF7; color: #fff; border: none; padding: 10px 20px; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: inherit; }
        .btn-primary:hover { background: #2563EB; }
        .btn-secondary { background: #F1F5F9; color: #475569; border: none; padding: 10px 20px; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: inherit; }
        .btn-edit { background: #EFF6FF; color: #4F8EF7; border: none; padding: 7px 14px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; }
        .btn-danger { background: #FEF2F2; color: #DC2626; border: none; padding: 7px 14px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; }
        .form-card { background: #fff; border-radius: 16px; border: 1px solid #E2E8F0; padding: 28px; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
        .form-title { font-size: 16px; font-weight: 700; color: #1E293B; margin-bottom: 20px; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
        .form-full { grid-column: 1 / -1; }
        .form-label { font-size: 13px; font-weight: 600; color: #475569; display: block; margin-bottom: 6px; }
        .form-input { width: 100%; padding: 10px 14px; border: 1.5px solid #E2E8F0; border-radius: 10px; font-size: 14px; font-family: inherit; outline: none; background: #F8FAFC; }
        .form-input:focus { border-color: #4F8EF7; background: #fff; }
        .form-actions { display: flex; gap: 10px; }
        .services-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
        .service-card { background: #fff; border-radius: 16px; border: 1px solid #E2E8F0; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
        .service-name { font-size: 16px; font-weight: 700; color: #1E293B; margin-bottom: 8px; }
        .service-desc { font-size: 13px; color: #64748B; margin-bottom: 12px; line-height: 1.5; }
        .service-price { font-size: 22px; font-weight: 800; color: #4F8EF7; margin-bottom: 4px; }
        .service-duration { font-size: 12px; color: #94A3B8; margin-bottom: 16px; }
        .service-actions { display: flex; gap: 8px; }
        .message { font-size: 14px; font-weight: 600; margin-bottom: 16px; padding: 10px 14px; border-radius: 8px; background: #F0FDF4; color: #16A34A; }
        .empty { text-align: center; padding: 60px 20px; color: #94A3B8; font-size: 14px; }
        @media (max-width: 768px) { .services-grid { grid-template-columns: 1fr; } .form-grid { grid-template-columns: 1fr; } }
      `}</style>

      <div className="page-title">🚗 Serviços</div>
      <div className="page-sub">Gerencie os serviços oferecidos pela sua estética</div>

      {message && <div className="message">{message}</div>}

      <div className="toolbar">
        <button className="btn-primary" onClick={() => { resetForm(); setShowForm(!showForm); }}>
          + Novo Serviço
        </button>
      </div>

      {showForm && (
        <div className="form-card">
          <div className="form-title">{editingId ? "Editar Serviço" : "Novo Serviço"}</div>
          <div className="form-grid">
            <div className="form-full">
              <label className="form-label">Nome do Serviço *</label>
              <input className="form-input" placeholder="Ex: Lavagem Completa" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="form-full">
              <label className="form-label">Descrição</label>
              <input className="form-input" placeholder="Descrição do serviço..." value={description} onChange={e => setDescription(e.target.value)} />
            </div>
            <div>
              <label className="form-label">Preço (R$) *</label>
              <input className="form-input" type="number" placeholder="0,00" value={price} onChange={e => setPrice(e.target.value)} />
            </div>
            <div>
              <label className="form-label">Duração (minutos)</label>
              <input className="form-input" type="number" placeholder="60" value={duration} onChange={e => setDuration(e.target.value)} />
            </div>
          </div>
          <div className="form-actions">
            <button className="btn-primary" onClick={handleSave} disabled={loading}>
              {loading ? "Salvando..." : "💾 Salvar Serviço"}
            </button>
            <button className="btn-secondary" onClick={resetForm}>Cancelar</button>
          </div>
        </div>
      )}

      {services.length === 0 ? (
        <div className="empty">
          Nenhum serviço cadastrado ainda.<br />
          <span style={{color:"#4F8EF7", cursor:"pointer", fontWeight:600}} onClick={() => setShowForm(true)}>
            Cadastrar primeiro serviço →
          </span>
        </div>
      ) : (
        <div className="services-grid">
          {services.map(s => (
            <div key={s.id} className="service-card">
              <div className="service-name">{s.name}</div>
              {s.description && <div className="service-desc">{s.description}</div>}
              <div className="service-price">R$ {s.price.toFixed(2)}</div>
              <div className="service-duration">⏱️ {s.duration} minutos</div>
              <div className="service-actions">
                <button className="btn-edit" onClick={() => handleEdit(s)}>✏️ Editar</button>
                <button className="btn-danger" onClick={() => handleDelete(s.id)}>🗑️ Excluir</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}