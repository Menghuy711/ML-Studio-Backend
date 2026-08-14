import { useContext, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContextValues';
import { asset } from '../lib/asset';

export default function AdminLayout() {
  const { user, signOut } = useContext(AuthContext);
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const username =
    user?.user_metadata?.username || user?.email?.split('@')[0] || 'Admin';

  const navItems = [
    { to: '/admin/dashboard', icon: 'bi-speedometer2', label: 'Dashboard' },
    { to: '/admin/products',  icon: 'bi-bag',           label: 'Products' },
    { to: '/admin/orders',    icon: 'bi-receipt',       label: 'Orders' },
    { to: '/admin/messages',  icon: 'bi-chat-dots',     label: 'Messages' },
  ];

  return (
    <div className="admin-wrapper">
      {/* ── Sidebar ── */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="admin-logo">
          <img src={asset('/images/logo/ML Studio LOGO.png')} alt="ML Studio" className="admin-logo-img" />
        </div>

        <nav className="admin-nav">
          {navItems.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `admin-nav-link ${isActive ? 'active' : ''}`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <i className={`bi ${icon}`}></i>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <a href="/" className="admin-nav-link" target="_blank" rel="noreferrer">
            <i className="bi bi-box-arrow-up-right"></i>
            <span>View Store</span>
          </a>
          <button className="admin-nav-link admin-logout-btn" onClick={handleSignOut}>
            <i className="bi bi-box-arrow-right"></i>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ── Sidebar overlay (mobile) ── */}
      {sidebarOpen && (
        <div
          className="admin-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Main area ── */}
      <div className="admin-main">
        {/* Top bar */}
        <header className="admin-topbar">
          <button
            className="admin-hamburger"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            <i className="bi bi-list"></i>
          </button>
          <div className="admin-topbar-right">
            <div className="admin-user-chip">
              <div className="admin-user-avatar">
                {username.charAt(0).toUpperCase()}
              </div>
              <span className="admin-user-name">{username}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
