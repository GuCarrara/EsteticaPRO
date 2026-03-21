"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

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

export default function ClienteDetailPage() {
  const { id } = useParams();
  const [client, setClient] = useState<Client | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [plate, setPlate] = useState("");
  const [color, setColor] = useState("");

  const loadClient = async () => {
    const res = await fetch("/api/clientes");
    const data = await res.json();
    if (Array.isArray(data)) {
      const found = data.find((c: Client) => c.id === id);
      if (found) setClient(found);
    }
  };

  useEffect(() => { loadClient(); }, [id]);

  const handleAddVehicle = async () => {
    if (!brand || !model) { setMessage("⚠️ Marca e modelo são obrigatórios!"); return; }
    setLoading(true);
    await fetch("/api/veiculos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clientId: id, brand, model, year, plate, color }),
    });
    setBrand(""); setModel(""); setYear(""); setPlate(""); setColor("");
    setShowForm(false);
    setMessage("✅ Veículo cadastrado!");
    setLoading(false);
    loadClient();
    setTimeout(() => setMessage(""), 3000);
  };

  const handleDeleteVehicle = async (vehicleId: string) => {
    if (!confirm("Excluir este veículo?")) return;
    await fetch(`/api/veiculos?id=${vehicleId}`, { method: "DELETE" });
    loadClient();
  };

  if (!client) return <div style={{padding:40, color:"#64748B"}}>Carregando...</div>;

  return (
    <>
      <style>{`
        .page-title { font-size: 24px; font-weight: 700; color: #1E293B; margin-bottom: 4px; }
        .page-sub { font-size: 14px; color: #64748B; margin-bottom: 24px; }
        .back-btn { display: inline-flex; align-items: center; gap: 6px; color: #4F8EF7; font-size: 14px; font-weight: 600; text-decoration: none; margin-bottom: 20px; }
        .card { background: #fff; border-radius: 16px; border: 1px solid #E2E8F0; padding: 24px; margin-bottom: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
        .card-title { font-size: 15px; font-weight: 700; color: #1E293B; margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #F1F5F9; font-size: 14px; }
        .detail-row:last-child { border-bottom: none; }
        .detail-label { color: #64748B; }
        .detail-value { font-weight: 600; color: #1E293B; }
        .vehicle-card { background: #F8FAFC; border-radius: 12px; border: 1px solid #E2E8F0; padding: 16px; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between; }
        .vehicle-info { font-size: 15px; font-weight: 700; color: #1E293B; }
        .vehicle-sub { font-size: 13px; color: #64748B; margin-top: 2px; }
        .btn-primary { background: #4F8EF7; color: #fff; border: none; padding: 10px 20px; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: inherit; }
        .btn-primary:hover { background: #2563EB; }
        .btn-danger { background: none; border: none; color: #DC2626; cursor: pointer; font-size: 18px; padding: 4px; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
        .form-label { font-size: 13px; font-weight: 600; color: #475569; display: block; margin-bottom: 6px; }
        .form-input { width: 100%; padding: 10px 14px; border: 1.5px solid #E2E8F0; border-radius: 10px; font-size: 14px; font-family: inherit; outline: none; background: #F8FAFC; }
        .form-input:focus { border-color: #4F8EF7; background: #fff; }
        .form-actions { display: flex; gap: 10px; }
        .btn-secondary { background: #F1F5F9; color: #475569; border: none; padding: 10px 20px; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; font-family: inherit; }
        .message { font-size: 14px; font-weight: 600; margin-bottom: 16px; padding: 10px 14px; border-radius: 8px; background: #F0FDF4; color: #16A34A; }
        .empty { text-align: center; padding: 32px; color: #94A3B8; font-size: 14px; }
        @media (max-width: 768px) { .form-grid { grid-template-columns: 1fr; } }
      `}</style>

      <a href="/clientes" className="back-btn">← Voltar para Clientes</a>

      <div className="page-title">👤 {client.name}</div>
      <div className="page-sub">Detalhes e veículos do cliente</div>

      {message && <div className="message">{message}</div>}

      {/* Dados do cliente */}
      <div className="card">
        <div className="card-title">Dados do Cliente</div>
        <div className="detail-row"><span className="detail-label">Nome</span><span className="detail-value">{client.name}</span></div>
        <div className="detail-row"><span className="detail-label">Telefone</span><span className="detail-value">{client.phone || "—"}</span></div>
        <div className="detail-row"><span className="detail-label">E-mail</span><span className="detail-value">{client.email || "—"}</span></div>
        <div className="detail-row"><span className="detail-label">CPF</span><span className="detail-value">{client.cpf || "—"}</span></div>
      </div>

      {/* Veículos */}
      <div className="card">
        <div className="card-title">
          🚗 Veículos ({client.vehicles.length})
          <button className="btn-primary" onClick={() => setShowForm(!showForm)}>+ Adicionar Veículo</button>
        </div>

        {showForm && (
          <div style={{background:"#F8FAFC", borderRadius:12, padding:20, marginBottom:16, border:"1px solid #E2E8F0"}}>
            <div className="form-grid">
              <div>
                <label className="form-label">Marca *</label>
                <input className="form-input" placeholder="Ex: Volkswagen" value={brand} onChange={e => setBrand(e.target.value)} />
              </div>
              <div>
                <label className="form-label">Modelo *</label>
                <input className="form-input" placeholder="Ex: Gol" value={model} onChange={e => setModel(e.target.value)} />
              </div>
              <div>
                <label className="form-label">Ano</label>
                <input className="form-input" placeholder="Ex: 2020" value={year} onChange={e => setYear(e.target.value)} />
              </div>
              <div>
                <label className="form-label">Placa</label>
                <input className="form-input" placeholder="Ex: ABC1D23" value={plate} onChange={e => setPlate(e.target.value)} />
              </div>
              <div>
                <label className="form-label">Cor</label>
                <input className="form-input" placeholder="Ex: Prata" value={color} onChange={e => setColor(e.target.value)} />
              </div>
            </div>
            <div className="form-actions">
              <button className="btn-primary" onClick={handleAddVehicle} disabled={loading}>
                {loading ? "Salvando..." : "💾 Salvar Veículo"}
              </button>
              <button className="btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
            </div>
          </div>
        )}

        {client.vehicles.length === 0 ? (
          <div className="empty">Nenhum veículo cadastrado.<br />
            <span style={{color:"#4F8EF7", cursor:"pointer", fontWeight:600}} onClick={() => setShowForm(true)}>
              Adicionar veículo →
            </span>
          </div>
        ) : (
          client.vehicles.map(v => (
            <div key={v.id} className="vehicle-card">
              <div>
                <div className="vehicle-info">🚗 {v.brand} {v.model} {v.year ? `(${v.year})` : ""}</div>
                <div className="vehicle-sub">
                  {v.plate && `Placa: ${v.plate}`}
                  {v.plate && v.color && " · "}
                  {v.color && `Cor: ${v.color}`}
                </div>
              </div>
              <button className="btn-danger" onClick={() => handleDeleteVehicle(v.id)}>🗑️</button>
            </div>
          ))
        )}
      </div>
    </>
  );
}