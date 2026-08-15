import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { asset } from '../lib/asset';

const STATUS_OPTIONS = ['pending', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  // Delete confirm
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error: err } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (!err) setOrders(data || []);
    else setError(err.message);
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    const { error: err } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);
    setUpdatingId(null);
    if (err) { setError(err.message); return; }
    setSuccess(`Order status updated to "${newStatus}"`);
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
  };

  const handleDelete = async () => {
    setDeleting(true);
    const { error: err } = await supabase.from('orders').delete().eq('id', deleteId);
    setDeleting(false);
    setDeleteId(null);
    if (err) { setError(err.message); return; }
    setSuccess('Order deleted.');
    fetchOrders();
  };

  const filtered = orders.filter((o) => {
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    const matchSearch = o.id.includes(search) ||
      (o.shipping_info?.name || '').toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="admin-page-content">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Orders</h1>
        <p className="admin-page-subtitle">{orders.length} total orders</p>
      </div>

      {success && <div className="alert alert-success alert-dismissible">{success}<button type="button" className="btn-close" onClick={() => setSuccess('')}></button></div>}
      {error   && <div className="alert alert-danger  alert-dismissible">{error}<button type="button" className="btn-close" onClick={() => setError('')}></button></div>}

      {/* Filters */}
      <div className="d-flex flex-wrap gap-3 mb-4">
        <div className="admin-search-bar" style={{ flex: 1, minWidth: '200px' }}>
          <i className="bi bi-search"></i>
          <input
            type="text"
            placeholder="Search by order ID or customer name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="admin-input"
          style={{ width: 'auto', minWidth: '140px' }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Statuses</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border" style={{ color: '#c9a84c' }} role="status" />
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="text-center text-muted py-4" data-label="">No orders found.</td></tr>
              )}
              {filtered.map((order) => (
                <>
                  <tr key={order.id}>
                    <td className="font-mono" style={{ fontSize: '0.85rem' }} data-label="Order ID">#{order.id.slice(0, 8)}</td>
                    <td data-label="Customer">
                      <div>
                        <div>{order.shipping_info?.fullName || order.shipping_info?.name || <span className="text-muted">Guest</span>}</div>
                        <small className="text-muted">{order.shipping_info?.email || ''}</small>
                      </div>
                    </td>
                    <td data-label="Date">{new Date(order.created_at).toLocaleDateString()}</td>
                    <td data-label="Items">{(order.items || []).length}</td>
                    <td data-label="Total">${Number(order.total).toFixed(2)}</td>
                    <td data-label="Status">
                      <select
                        className={`admin-status-select admin-status-select--${order.status}`}
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        disabled={updatingId === order.id}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                      </select>
                    </td>
                    <td data-label="">
                      <div className="d-flex gap-2">
                        <button
                          className="admin-btn-icon admin-btn-icon--view"
                          title="View items"
                          onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                        >
                          <i className={`bi ${expandedId === order.id ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
                        </button>
                        <button
                          className="admin-btn-icon admin-btn-icon--delete"
                          title="Delete order"
                          onClick={() => setDeleteId(order.id)}
                        >
                          <i className="bi bi-trash-fill"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                  {/* Expanded row */}
                  {expandedId === order.id && (
                    <tr key={`${order.id}-expanded`} className="admin-expanded-row">
                      <td colSpan={7}>
                        <div className="admin-expanded-content">
                          <div className="row g-3">
                            {/* Items */}
                            <div className="col-md-7">
                              <strong className="d-block mb-2">Order Items</strong>
                              <table className="admin-items-table" style={{ width: '100%', fontSize: '0.9rem' }}>
                                <thead>
                                  <tr style={{ borderBottom: '1px solid #eee' }}>
                                    <th className="pb-1">Product</th>
                                    <th className="pb-1">Qty</th>
                                    <th className="pb-1">Price</th>
                                    <th className="pb-1">Subtotal</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {(order.items || []).map((item, i) => (
                                    <tr key={i}>
                                      <td className="py-1" data-label="Product">
                                        <div className="d-flex align-items-center gap-2">
                                          <img src={asset(item.image)} alt={item.title} style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 4 }} />
                                          {item.title}
                                        </div>
                                      </td>
                                      <td data-label="Qty">×{item.quantity}</td>
                                      <td data-label="Price">${Number(item.price).toFixed(2)}</td>
                                      <td data-label="Subtotal">${(item.price * item.quantity).toFixed(2)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                            {/* Shipping info */}
                            <div className="col-md-5">
                              <strong className="d-block mb-2">Shipping Details</strong>
                              {order.shipping_info ? (
                                <div style={{ fontSize: '0.9rem' }}>
                                  <p className="mb-1"><strong>Name:</strong> {order.shipping_info.fullName || order.shipping_info.name || '—'}</p>
                                  <p className="mb-1"><strong>Email:</strong> {order.shipping_info.email}</p>
                                  <p className="mb-1"><strong>Phone:</strong> {order.shipping_info.phone}</p>
                                  <p className="mb-1"><strong>Address:</strong> {order.shipping_info.address}</p>
                                  <p className="mb-1"><strong>City:</strong> {order.shipping_info.city}</p>
                                </div>
                              ) : <p className="text-muted">No shipping info.</p>}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal admin-modal--sm">
            <div className="admin-modal-header">
              <h3>Delete Order</h3>
            </div>
            <div className="admin-modal-body">
              <p>Are you sure you want to delete order <strong>#{deleteId.slice(0, 8)}</strong>? This cannot be undone.</p>
              <div className="admin-modal-footer">
                <button className="admin-btn-secondary" onClick={() => setDeleteId(null)}>Cancel</button>
                <button className="admin-btn-danger" onClick={handleDelete} disabled={deleting}>
                  {deleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
