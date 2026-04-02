"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Session } from "next-auth";

const navItems = [
  { href: "/dashboard", icon: "📊", label: "Dashboard" },
  { href: "/agenda", icon: "📅", label: "Agenda" },
  { href: "/clientes", icon: "👤", label: "Clientes" },
  { href: "/servicos", icon: "🚗", label: "Serviços" },
  { href: "/assinatura", icon: "💳", label: "Assinatura" },
  { href: "/whatsapp", icon: "📱", label: "WhatsApp" },
];

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const isPublicPage =
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/assinar" ||
    pathname === "/obrigado" ||
    pathname === "/trocar-senha" ||
    pathname === "/recuperar-senha" ||
    pathname === "/redefinir-senha" ||
    pathname === "/definir-senha" ||
    pathname === "/termos-de-uso" ||
    pathname === "/politica-de-privacidade";

  useEffect(() => {
    if (status === "loading") return;
    if (!session && !isPublicPage) router.push("/login");
  }, [session, status, isPublicPage, router]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  if (status === "loading") return null;
  if (!session && !isPublicPage) return null;
  if (isPublicPage) return <>{children}</>;

  return (
    <>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Inter', sans-serif; background: #F1F5F9; }
        .sidebar { width: 240px; background: #1E293B; display: flex; flex-direction: column; padding: 24px 0; position: fixed; height: 100vh; top: 0; left: 0; z-index: 100; }
        .sidebar-logo { padding: 0 20px 24px; border-bottom: 1px solid rgba(255,255,255,0.08); }
        .sidebar-logo-text { font-size: 22px; font-weight: 800; color: #fff; }
        .sidebar-logo-text span { color: #4F8EF7; }
        .sidebar-logo-sub { font-size: 11px; color: rgba(255,255,255,0.4); margin-top: 2px; }
        .main-content { margin-left: 240px; min-height: 100vh; padding: 32px; }
        .nav-link { display: flex; align-items: center; gap: 10px; padding: 10px 16px; margin: 0 8px; border-radius: 10px; text-decoration: none; color: rgba(255,255,255,0.6); font-size: 14px; font-weight: 500; transition: all 0.15s; }
        .nav-link:hover { background: rgba(255,255,255,0.08); color: #fff; }
        .nav-link.active { background: #4F8EF7; color: #fff; }
        .nav-section { padding: 16px 8px 8px; }
        .mobile-topbar { display: none; position: fixed; top: 0; left: 0; right: 0; height: 56px; background: #1E293B; z-index: 200; align-items: center; justify-content: space-between; padding: 0 16px; }
        .drawer-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 150; }
        .drawer-overlay.open { display: block; }
        .mobile-drawer { position: fixed; top: 0; left: 0; width: 260px; height: 100vh; background: #1E293B; z-index: 160; transform: translateX(-100%); transition: transform 0.3s ease; padding: 24px 0; }
        .mobile-drawer.open { transform: translateX(0); }
        .hamburger { background: none; border: none; cursor: pointer; padding: 6px; display: flex; flex-direction: column; gap: 5px; }
        .hamburger span { display: block; width: 22px; height: 2px; background: #fff; border-radius: 2px; }
        @media (max-width: 768px) {
          .sidebar { display: none; }
          .mobile-topbar { display: flex; }
          .main-content { margin-left: 0; padding: 16px; padding-top: 72px; }
        }
      `}</style>

      {/* Mobile topbar */}
      <div className="mobile-topbar">
        <button className="hamburger" onClick={() => setMenuOpen(true)}>
          <span /><span /><span />
        </button>
        <div style={{color:"#fff", fontWeight:800, fontSize:18}}>Estética<span style={{color:"#4F8EF7"}}>Pro</span></div>
        <div style={{width:34}} />
      </div>

      <div className={`drawer-overlay ${menuOpen ? "open" : ""}`} onClick={() => setMenuOpen(false)} />

      {/* Mobile drawer */}
      <div className={`mobile-drawer ${menuOpen ? "open" : ""}`}>
        <div style={{padding:"0 20px 20px", borderBottom:"1px solid rgba(255,255,255,0.08)"}}>
          <div style={{fontSize:20, fontWeight:800, color:"#fff"}}>Estética<span style={{color:"#4F8EF7"}}>Pro</span></div>
        </div>
        <nav style={{padding:"16px 8px", display:"flex", flexDirection:"column", gap:4}}>
          {navItems.map((item) => (
            <a key={item.href} href={item.href} className={`nav-link ${pathname === item.href ? "active" : ""}`}>
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </a>
          ))}
        </nav>
        <div style={{padding:"16px 8px", borderTop:"1px solid rgba(255,255,255,0.08)", marginTop:"auto"}}>
          <a href="/api/auth/signout" className="nav-link" style={{color:"#EF4444"}}>
            <span>🚪</span><span>Sair</span>
          </a>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="sidebar">
        <div className="sidebar-logo">
          <img src="/logo.png" alt="EstéticaPro" style={{height:80, width:200, objectFit:"contain"}} />
          <div className="sidebar-logo-sub">Sistema para estéticas automotivas</div>
        </div>
        <nav style={{flex:1, padding:"16px 8px", display:"flex", flexDirection:"column", gap:4, overflowY:"auto"}}>
          {navItems.map((item) => (
            <a key={item.href} href={item.href} className={`nav-link ${pathname === item.href ? "active" : ""}`}>
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </a>
          ))}
        </nav>
        <div style={{padding:"16px 8px", borderTop:"1px solid rgba(255,255,255,0.08)"}}>
          <a href="/api/auth/signout" className="nav-link" style={{color:"#EF4444"}}>
            <span>🚪</span><span>Sair</span>
          </a>
        </div>
      </div>

      <main className="main-content">
        {children}
      </main>
    </>
  );
}

export default function ClientLayout({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session | null;
}) {
  return (
    <SessionProvider session={session}>
      <html lang="pt-BR">
        <body>
          <AuthGuard>{children}</AuthGuard>
        </body>
      </html>
    </SessionProvider>
  );
}