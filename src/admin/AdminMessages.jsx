import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const fetchMessages = async () => {
    setLoading(true);
    const { data, error: err } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });
    if (!err) setMessages(data || []);
    else setError(err.message);
    setLoading(false);
  };

  useEffect(() => { fetchMessages(); }, []);

  const handleDelete = async () => {
    setDeleting(true);
    const { error: err } = await supabase.from('contact_messages').delete().eq('id', deleteId);
    setDeleting(false);
    setDeleteId(null);
    if (err) { setError(err.message); return; }
    setSuccess('Message deleted.');
    setMessages((prev) => prev.filter((m) => m.id !== deleteId));
  };

  const filtered = messages.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase()) ||
    m.message.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-page-content">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Contact Messages</h1>
        <p className="admin-page-subtitle">{messages.length} message(s) received</p>
      </div>

      {success && <div className="alert alert-success alert-dismissible">{success}<button type="button" className="btn-close" onClick={() => setSuccess('')}></button></div>}
      {error   && <div className="alert alert-danger  alert-dismissible">{error}<button type="button" className="btn-close" onClick={() => setError('')}></button></div>}

      {/* Search */}
      <div className="admin-search-bar mb-4">
        <i className="bi bi-search"></i>
        <input
          type="text"
          placeholder="Search by name, email or message..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border" style={{ color: '#c9a84c' }} role="status" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <i className="bi bi-inbox fs-1 d-block mb-3"></i>
          <p>No messages found.</p>
        </div>
      ) : (
        <div className="admin-messages-grid">
          {filtered.map((msg) => (
            <div key={msg.id} className="admin-message-card">
              <div className="admin-message-header">
                <div className="admin-message-avatar">
                  {msg.name.charAt(0).toUpperCase()}
                </div>
                <div className="admin-message-meta">
                  <strong>{msg.name}</strong>
                  <span>{msg.email}</span>
                </div>
                <span className="admin-message-date">
                  {new Date(msg.created_at).toLocaleDateString()}
                </span>
              </div>

              <div className={`admin-message-body ${expandedId === msg.id ? 'expanded' : ''}`}>
                <p>{msg.message}</p>
              </div>

              <div className="admin-message-footer">
                <button
                  className="admin-btn-text"
                  onClick={() => setExpandedId(expandedId === msg.id ? null : msg.id)}
                >
                  {expandedId === msg.id ? 'Show less' : 'Read more'}
                </button>
                <div className="d-flex gap-2">
                  <a
                    href={`mailto:${msg.email}?subject=Re: Your message to ML Studio`}
                    className="admin-btn-icon admin-btn-icon--view"
                    title="Reply via email"
                  >
                    <i className="bi bi-reply-fill"></i>
                  </a>
                  <button
                    className="admin-btn-icon admin-btn-icon--delete"
                    title="Delete message"
                    onClick={() => setDeleteId(msg.id)}
                  >
                    <i className="bi bi-trash-fill"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal admin-modal--sm">
            <div className="admin-modal-header">
              <h3>Delete Message</h3>
            </div>
            <div className="admin-modal-body">
              <p>Are you sure you want to delete this message? This cannot be undone.</p>
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
