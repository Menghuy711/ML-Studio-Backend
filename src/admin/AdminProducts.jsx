import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { asset } from '../lib/asset';

const CATEGORIES = ['Backpacks', 'Luggage', 'Travel Bags', 'Sling & Crossbody Bags', 'Duffel Bags', 'Tote Bags', 'Accessories'];
const BADGE_CLASSES = ['bg-dark', 'bg-danger', 'bg-success', 'bg-warning', 'bg-secondary', 'bg-info text-dark', 'bg-primary'];

const EMPTY_FORM = {
  id: '',
  name: '',
  description: '',
  price: '',
  category: 'Backpacks',
  image_url: '',
  badge: '',
  badge_class: 'bg-dark',
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null); // null = creating new
  const [form, setForm] = useState(EMPTY_FORM);

  // Image upload
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState('');
  const fileInputRef = useRef(null);

  // Delete confirm
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Search
  const [search, setSearch] = useState('');

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error: err } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    if (!err) setProducts(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, []);

  const clearImage = () => {
    setImageFile(null);
    setPreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleImageChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please choose a valid image file.');
      return;
    }
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
    setError('');
  };

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setError('');
    setSuccess('');
    clearImage();
    setShowModal(true);
  };

  const openEdit = (product) => {
    setForm({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      image_url: product.image_url,
      badge: product.badge,
      badge_class: product.badge_class,
    });
    setEditingId(product.id);
    setError('');
    setSuccess('');
    clearImage();
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError('');
    clearImage();
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const generateId = (name) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    let imageUrl = form.image_url.trim();

    // Upload a freshly selected image first
    if (imageFile) {
      setUploading(true);

      // Best-effort: make sure the bucket exists (no-op if it already does).
      await supabase.storage.createBucket('products', { public: true });

      const fileExt = (imageFile.name.split('.').pop() || 'jpg').toLowerCase();
      const filePath = `products/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${fileExt}`;
      const { error: uploadErr } = await supabase.storage
        .from('products')
        .upload(filePath, imageFile, { upsert: true, contentType: imageFile.type });
      setUploading(false);
      if (uploadErr) {
        setSaving(false);
        const msg = /bucket|not found|does not exist/i.test(uploadErr.message)
          ? 'Image upload failed: the "products" storage bucket does not exist. Open the Supabase dashboard → SQL Editor, run the storage setup from supabase-admin-schema.sql (section 8), then try again.'
          : `Image upload failed: ${uploadErr.message}`;
        setError(msg);
        return;
      }
      imageUrl = supabase.storage.from('products').getPublicUrl(filePath).data.publicUrl;
    }

    if (!imageUrl) {
      setSaving(false);
      setError('Please upload an image or enter an image URL.');
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: parseFloat(form.price),
      category: form.category,
      image_url: imageUrl,
      badge: form.badge.trim(),
      badge_class: form.badge_class,
    };

    let err;

    if (editingId) {
      // UPDATE — keep color images in sync with the new main image so the
      // product detail page (which renders the selected color's image) updates too.
      const existing = products.find((p) => p.id === editingId);
      const oldImage = existing?.image_url || '';
      let colors = existing?.colors || [];

      if (imageUrl !== oldImage) {
        const nextColors = colors.map((c) =>
          c.image === oldImage ? { ...c, image: imageUrl } : c
        );
        if (!nextColors.some((c) => c.image === imageUrl)) {
          if (nextColors.length) {
            nextColors[0] = { ...nextColors[0], image: imageUrl };
          } else {
            nextColors.push({ name: 'Default', hex: '#1a1a1a', image: imageUrl });
          }
        }
        colors = nextColors;
      }

      ({ error: err } = await supabase
        .from('products')
        .update({ ...payload, colors })
        .eq('id', editingId));
    } else {
      // CREATE — generate a slug id
      const newId = generateId(form.name) || `product-${Date.now()}`;
      ({ error: err } = await supabase
        .from('products')
        .insert({ id: newId, ...payload, colors: [], features: [] }));
    }

    setSaving(false);
    if (err) {
      setError(err.message);
      return;
    }

    setSuccess(editingId ? 'Product updated!' : 'Product created!');
    closeModal();
    fetchProducts();
  };

  const confirmDelete = (id) => setDeleteId(id);
  const cancelDelete  = ()  => setDeleteId(null);

  const handleDelete = async () => {
    setDeleting(true);
    const { error: err } = await supabase.from('products').delete().eq('id', deleteId);
    setDeleting(false);
    setDeleteId(null);
    if (err) { setError(err.message); return; }
    setSuccess('Product deleted.');
    fetchProducts();
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-page-content">
      <div className="admin-page-header d-flex flex-wrap justify-content-between align-items-start gap-3">
        <div>
          <h1 className="admin-page-title">Products</h1>
          <p className="admin-page-subtitle">{products.length} products in catalogue</p>
        </div>
        <button className="admin-action-btn" onClick={openCreate}>
          <i className="bi bi-plus-circle me-2"></i>Add Product
        </button>
      </div>

      {success && <div className="alert alert-success alert-dismissible" role="alert">{success}<button type="button" className="btn-close" onClick={() => setSuccess('')}></button></div>}
      {error   && <div className="alert alert-danger  alert-dismissible" role="alert">{error}<button type="button" className="btn-close" onClick={() => setError('')}></button></div>}

      {/* Search */}
      <div className="admin-search-bar mb-4">
        <i className="bi bi-search"></i>
        <input
          type="text"
          placeholder="Search products by name or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
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
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Badge</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="text-center text-muted py-4">No products found.</td></tr>
              )}
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td data-label="Image">
                    <img
                      src={asset(p.image_url)}
                      alt={p.name}
                      style={{ width: 52, height: 52, objectFit: 'cover', borderRadius: 8, background: '#f5f5f5' }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </td>
                  <td data-label="Name">
                    <div>
                      <strong>{p.name}</strong>
                      <br />
                      <small className="text-muted">{p.id}</small>
                    </div>
                  </td>
                  <td data-label="Category">{p.category}</td>
                  <td data-label="Price">${Number(p.price).toFixed(2)}</td>
                  <td data-label="Badge"><span className={`badge ${p.badge_class}`}>{p.badge}</span></td>
                  <td data-label="">
                    <div className="d-flex gap-2">
                      <button className="admin-btn-icon admin-btn-icon--edit" onClick={() => openEdit(p)} title="Edit">
                        <i className="bi bi-pencil-fill"></i>
                      </button>
                      <button className="admin-btn-icon admin-btn-icon--delete" onClick={() => confirmDelete(p.id)} title="Delete">
                        <i className="bi bi-trash-fill"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Create / Edit Modal ── */}
      {showModal && (
        <div className="admin-modal-backdrop" onClick={closeModal}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>{editingId ? 'Edit Product' : 'Add New Product'}</h3>
              <button className="admin-modal-close" onClick={closeModal}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <form onSubmit={handleSave} className="admin-modal-body">
              {error && <div className="alert alert-danger py-2 small">{error}</div>}

              <div className="row g-3">
                <div className="col-12">
                  <label className="admin-label">Product Name *</label>
                  <input className="admin-input" name="name" value={form.name} onChange={handleChange} required placeholder="e.g. Urban Daypack" />
                </div>
                <div className="col-md-6">
                  <label className="admin-label">Price (USD) *</label>
                  <input className="admin-input" name="price" type="number" min="0" step="0.01" value={form.price} onChange={handleChange} required placeholder="e.g. 89.99" />
                </div>
                <div className="col-md-6">
                  <label className="admin-label">Category *</label>
                  <select className="admin-input" name="category" value={form.category} onChange={handleChange} required>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="col-12">
                  <label className="admin-label">Product Image *</label>
                  <div className="admin-image-uploader">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="admin-image-uploader-input"
                      onChange={handleImageChange}
                    />
                    {preview || form.image_url ? (
                      <img
                        className="admin-image-uploader-thumb"
                        src={preview || asset(form.image_url)}
                        alt="Product preview"
                        onError={(e) => { e.currentTarget.style.opacity = 0.25; }}
                      />
                    ) : (
                      <div className="admin-image-uploader-placeholder">
                        <i className="bi bi-image"></i>
                      </div>
                    )}
                    <div className="admin-image-uploader-actions">
                      <button
                        type="button"
                        className="admin-action-btn"
                        onClick={() => fileInputRef.current && fileInputRef.current.click()}
                      >
                        <i className="bi bi-upload me-1"></i>{preview ? 'Change Image' : 'Upload Image'}
                      </button>
                      {imageFile && (
                        <button type="button" className="admin-btn-text" onClick={clearImage}>
                          <i className="bi bi-x-circle me-1"></i> Remove
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="admin-image-uploader-sep"><span>or paste an image URL</span></div>
                  <input
                    className="admin-input"
                    name="image_url"
                    value={form.image_url}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div className="col-12">
                  <label className="admin-label">Description *</label>
                  <textarea className="admin-input" name="description" rows={3} value={form.description} onChange={handleChange} required placeholder="Short product description..." />
                </div>
                <div className="col-md-6">
                  <label className="admin-label">Badge Label</label>
                  <input className="admin-input" name="badge" value={form.badge} onChange={handleChange} placeholder="e.g. Bestseller" />
                </div>
                <div className="col-md-6">
                  <label className="admin-label">Badge Style</label>
                  <select className="admin-input" name="badge_class" value={form.badge_class} onChange={handleChange}>
                    {BADGE_CLASSES.map((bc) => <option key={bc} value={bc}>{bc}</option>)}
                  </select>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="admin-btn-secondary" onClick={closeModal}>Cancel</button>
                <button type="submit" className="admin-action-btn" disabled={saving || uploading}>
                  {uploading
                    ? <><span className="spinner-border spinner-border-sm me-2" />Uploading...</>
                    : saving
                      ? <><span className="spinner-border spinner-border-sm me-2" />Saving...</>
                      : (editingId ? 'Save Changes' : 'Create Product')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteId && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal admin-modal--sm">
            <div className="admin-modal-header">
              <h3>Confirm Delete</h3>
            </div>
            <div className="admin-modal-body">
              <p>Are you sure you want to delete this product? This action cannot be undone.</p>
              <div className="admin-modal-footer">
                <button className="admin-btn-secondary" onClick={cancelDelete}>Cancel</button>
                <button className="admin-btn-danger" onClick={handleDelete} disabled={deleting}>
                  {deleting ? 'Deleting...' : 'Yes, Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
