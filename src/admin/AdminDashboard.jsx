import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ products: 0, orders: 0, messages: 0, revenue: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const [
        { count: productCount },
        { count: orderCount },
        { count: messageCount },
        { data: ordersData },
        { data: recentOrdersData },
      ] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('contact_messages').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('total'),
        supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(5),
      ]);

      const revenue = (ordersData || []).reduce((sum, o) => sum + Number(o.total), 0);

      setStats({
        products: productCount || 0,
        orders: orderCount || 0,
        messages: messageCount || 0,
        revenue,
      });
      setRecentOrders(recentOrdersData || []);
      setLoading(false);
    }
    fetchStats();
  }, []);

  const statCards = [
    { label: 'Total Products',  value: stats.products,              icon: 'bi-bag-fill',          color: '#c9a84c', link: '/admin/products' },
    { label: 'Total Orders',    value: stats.orders,                icon: 'bi-receipt-cutoff',    color: '#4c8ec9', link: '/admin/orders' },
    { label: 'Messages',        value: stats.messages,              icon: 'bi-chat-dots-fill',    color: '#10361F', link: '/admin/messages' },
    { label: 'Total Revenue',   value: `$${stats.revenue.toFixed(2)}`, icon: 'bi-currency-dollar', color: '#6d4cc9', link: '/admin/orders' },
  ];

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <div className="spinner-border" style={{ color: '#c9a84c' }} role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page-content">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Admin Dashboard</h1>
        <p className="admin-page-subtitle">Welcome back! Here's what's happening with your store.</p>
      </div>

      {/* Stat Cards */}
      <div className="admin-stats-grid">
        {statCards.map((card) => (
          <Link to={card.link} key={card.label} className="admin-stat-card" style={{ textDecoration: 'none' }}>
            <div className="admin-stat-icon" style={{ background: card.color }}>
              <i className={`bi ${card.icon}`}></i>
            </div>
            <div className="admin-stat-info">
              <p className="admin-stat-label">{card.label}</p>
              <h2 className="admin-stat-value">{card.value}</h2>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="admin-section">
        <h2 className="admin-section-title">Quick Actions</h2>
        <div className="d-flex flex-wrap gap-3">
          <Link to="/admin/products" className="admin-action-btn">
            <i className="bi bi-plus-circle me-2"></i>Add Product
          </Link>
          <Link to="/admin/orders" className="admin-action-btn admin-action-btn--outline">
            <i className="bi bi-eye me-2"></i>View All Orders
          </Link>
          <Link to="/admin/messages" className="admin-action-btn admin-action-btn--outline">
            <i className="bi bi-envelope me-2"></i>Read Messages
          </Link>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="admin-section">
        <h2 className="admin-section-title">Recent Orders</h2>
        {recentOrders.length === 0 ? (
          <p className="text-muted">No orders yet.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="font-mono">#{order.id.slice(0, 8)}</td>
                    <td>{new Date(order.created_at).toLocaleDateString()}</td>
                    <td>{(order.items || []).length} item(s)</td>
                    <td>${Number(order.total).toFixed(2)}</td>
                    <td>
                      <span className={`admin-status-badge admin-status-badge--${order.status}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Link to="/admin/orders" className="admin-link-more">View all orders →</Link>
      </div>
    </div>
  );
}
