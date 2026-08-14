import { useContext, useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../context/CartContextValues';
import { AuthContext } from '../context/AuthContextValues';
import { LayoutContext } from '../context/LayoutContextValues';
import { supabase } from '../lib/supabaseClient';
import { asset } from '../lib/asset';

export default function Checkout() {
  const { cartItems, cartTotal, clearCart } = useContext(CartContext);
  const { user, loading } = useContext(AuthContext);
  const { setActiveModal, showAuthToast } = useContext(LayoutContext);

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [orderId, setOrderId] = useState(null);
  const finalTotalRef = useRef(0);

  const [form, setForm] = useState({
    fullName: '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    notes: '',
  });

  useEffect(() => {
    if (user?.email && !form.email) {
      setForm((prev) => ({ ...prev, email: user.email }));
    }
  }, [user]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Final auth guard — show toast if guest somehow reaches Place Order
    if (!user) {
      showAuthToast();
      return;
    }

    if (!form.fullName || !form.email || !form.phone || !form.address || !form.city) {
      setError('Please fill in all required fields.');
      return;
    }

    if (cartItems.length === 0) {
      setError('Your cart is empty.');
      return;
    }

    setSubmitting(true);

    const orderData = {
      user_id: user?.id || null,
      items: cartItems.map((item) => ({
        id: item.id,
        title: item.title,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        color: item.color || null,
      })),
      total: cartTotal,
      status: 'pending',
      shipping_info: {
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        address: form.address,
        city: form.city,
        notes: form.notes,
      },
    };

    const { data, error: insertError } = await supabase
      .from('orders')
      .insert(orderData)
      .select('id')
      .single();

    setSubmitting(false);

    if (insertError) {
      setError(insertError.message || 'Failed to place order. Please try again.');
      return;
    }

    setOrderId(data.id);
    finalTotalRef.current = cartTotal;
    setSubmitted(true);
    clearCart();
  };

  // 1. Wait for session to restore before rendering anything
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-secondary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // 2. Guest users — show clear message with login CTA
  if (!user) {
    return (
      <section className="container py-5 text-center">
        <div className="mb-4">
          <i className="fa-solid fa-lock fa-4x" style={{ color: '#C9A84C' }}></i>
        </div>
        <h1 className="fw-bold mb-3">Login Required</h1>
        <p className="lead mb-4">
          You must log in before placing an order.
        </p>
        <div className="d-flex justify-content-center gap-3">
          <button
            className="btn gold-btn btn-lg"
            onClick={() => setActiveModal('login')}
          >
            <i className="bi bi-box-arrow-in-right me-2"></i>Log In
          </button>
          <Link to="/products" className="btn btn-outline-dark btn-lg">
            Continue Shopping
          </Link>
        </div>
      </section>
    );
  }

  // 3. Redirect if cart is empty and not yet submitted
  if (cartItems.length === 0 && !submitted) {
    return (
      <section className="container py-5 text-center">
        <h1 className="fw-bold mb-3">Your Cart is Empty</h1>
        <p className="lead">Add some items before checking out.</p>
        <Link to="/products" className="btn gold-btn">
          Browse Products
        </Link>
      </section>
    );
  }

  if (submitted) {
    return (
      <section className="container py-5 text-center">
        <div className="mb-4">
          <i className="fa-solid fa-circle-check fa-4x text-success"></i>
        </div>
        <h1 className="fw-bold mb-3">Order Placed Successfully!</h1>
        <p className="lead">
          Thank you, <strong>{form.fullName}</strong>. Your order has been received.
        </p>
        <p className="text-muted">
          Order total: <strong>${finalTotalRef.current.toFixed(2)}</strong>
        </p>
        {orderId && (
          <p className="text-muted">
            Order ID: <code>{orderId}</code>
          </p>
        )}
        <div className="d-flex justify-content-center gap-3 mt-4">
          <Link to="/products" className="btn gold-btn">
            Continue Shopping
          </Link>
          <Link to="/" className="btn btn-outline-dark">
            Back to Home
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="py-5" style={{ background: '#fafafa', minHeight: 'calc(100vh - 200px)' }}>
      <div className="container">
        {/* Header */}
        <div className="mb-5">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-2">
              <li className="breadcrumb-item"><Link to="/" className="text-decoration-none" style={{ color: '#C9A24A' }}>Home</Link></li>
              <li className="breadcrumb-item"><Link to="/products" className="text-decoration-none" style={{ color: '#C9A24A' }}>Products</Link></li>
              <li className="breadcrumb-item active" aria-current="page">Checkout</li>
            </ol>
          </nav>
          <h1 className="fw-bold mb-1" style={{ fontSize: '2rem', color: '#1a1a1a' }}>Checkout</h1>
          <p className="text-muted mb-0">Complete your purchase by filling in your shipping details below.</p>
        </div>

        <div className="row g-4">
          {/* Left: Shipping Form */}
          <div className="col-lg-7">
            <div className="card border-0" style={{ borderRadius: '16px', boxShadow: '0 2px 20px rgba(0,0,0,0.06)' }}>
              <div className="card-body p-4 p-md-5">
                <div className="d-flex align-items-center gap-3 mb-4">
                  <div
                    className="d-flex align-items-center justify-content-center"
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #C9A24A 0%, #b8972e 100%)',
                    }}
                  >
                    <i className="fa-solid fa-truck-fast text-white"></i>
                  </div>
                  <div>
                    <h4 className="card-title mb-0 fw-bold" style={{ fontSize: '1.15rem' }}>Shipping Information</h4>
                    <small className="text-muted">Enter your delivery details</small>
                  </div>
                </div>

                {error && (
                  <div className="alert alert-danger d-flex align-items-center gap-2" style={{ borderRadius: '10px', border: 'none' }}>
                    <i className="fa-solid fa-circle-exclamation"></i>
                    <span className="small">{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  {/* Full Name */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold small text-muted text-uppercase" style={{ letterSpacing: '0.5px' }}>
                      Full Name <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-white border-end-0" style={{ borderRadius: '10px 0 0 10px' }}>
                        <i className="fa-regular fa-user text-muted"></i>
                      </span>
                      <input
                        type="text"
                        name="fullName"
                        className="form-control border-start-0 ps-0"
                        placeholder="John Doe"
                        value={form.fullName}
                        onChange={handleChange}
                        required
                        style={{ borderRadius: '0 10px 10px 0', padding: '0.65rem 0.75rem' }}
                      />
                    </div>
                  </div>

                  {/* Email & Phone */}
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold small text-muted text-uppercase" style={{ letterSpacing: '0.5px' }}>
                        Email <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-white border-end-0" style={{ borderRadius: '10px 0 0 10px' }}>
                          <i className="fa-regular fa-envelope text-muted"></i>
                        </span>
                        <input
                          type="email"
                          name="email"
                          className="form-control border-start-0 ps-0"
                          placeholder="john@example.com"
                          value={form.email}
                          onChange={handleChange}
                          required
                          style={{ borderRadius: '0 10px 10px 0', padding: '0.65rem 0.75rem' }}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold small text-muted text-uppercase" style={{ letterSpacing: '0.5px' }}>
                        Phone <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-white border-end-0" style={{ borderRadius: '10px 0 0 10px' }}>
                          <i className="fa-solid fa-phone text-muted"></i>
                        </span>
                        <input
                          type="tel"
                          name="phone"
                          className="form-control border-start-0 ps-0"
                          placeholder="+1 (555) 000-0000"
                          value={form.phone}
                          onChange={handleChange}
                          required
                          style={{ borderRadius: '0 10px 10px 0', padding: '0.65rem 0.75rem' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold small text-muted text-uppercase" style={{ letterSpacing: '0.5px' }}>
                      Street Address <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-white border-end-0" style={{ borderRadius: '10px 0 0 10px' }}>
                        <i className="fa-solid fa-location-dot text-muted"></i>
                      </span>
                      <input
                        type="text"
                        name="address"
                        className="form-control border-start-0 ps-0"
                        placeholder="123 Main Street, Apt 4B"
                        value={form.address}
                        onChange={handleChange}
                        required
                        style={{ borderRadius: '0 10px 10px 0', padding: '0.65rem 0.75rem' }}
                      />
                    </div>
                  </div>

                  {/* City */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold small text-muted text-uppercase" style={{ letterSpacing: '0.5px' }}>
                      City <span className="text-danger">*</span>
                    </label>
                    <div className="input-group">
                      <span className="input-group-text bg-white border-end-0" style={{ borderRadius: '10px 0 0 10px' }}>
                        <i className="fa-solid fa-city text-muted"></i>
                      </span>
                      <input
                        type="text"
                        name="city"
                        className="form-control border-start-0 ps-0"
                        placeholder="New York"
                        value={form.city}
                        onChange={handleChange}
                        required
                        style={{ borderRadius: '0 10px 10px 0', padding: '0.65rem 0.75rem' }}
                      />
                    </div>
                  </div>

                  {/* Notes */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold small text-muted text-uppercase" style={{ letterSpacing: '0.5px' }}>
                      Order Notes <span className="fw-normal text-muted">(optional)</span>
                    </label>
                    <textarea
                      name="notes"
                      className="form-control"
                      rows="3"
                      placeholder="Any special delivery instructions..."
                      value={form.notes}
                      onChange={handleChange}
                      style={{ borderRadius: '10px', padding: '0.65rem 0.75rem' }}
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="btn w-100 py-3 fw-bold"
                    disabled={submitting}
                    style={{
                      background: 'linear-gradient(90deg, #1B4D2E, #10361F)',
                      color: '#fff',
                      borderRadius: '12px',
                      border: 'none',
                      fontSize: '1rem',
                      letterSpacing: '0.3px',
                      boxShadow: '0 4px 16px rgba(27, 77, 46, 0.25)',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(27, 77, 46, 0.35)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 16px rgba(27, 77, 46, 0.25)';
                    }}
                  >
                    {submitting ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Placing Order…
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-lock me-2"></i>
                        Place Secure Order — ${cartTotal.toFixed(2)}
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="col-lg-5">
            <div className="sticky-top" style={{ top: '20px', zIndex: 1 }}>
              <div className="card border-0" style={{ borderRadius: '16px', boxShadow: '0 2px 20px rgba(0,0,0,0.06)' }}>
                <div className="card-body p-4 p-md-5">
                  <div className="d-flex align-items-center justify-content-between mb-4">
                    <div className="d-flex align-items-center gap-3">
                      <div
                        className="d-flex align-items-center justify-content-center"
                        style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '12px',
                          background: 'linear-gradient(135deg, #1B4D2E 0%, #10361F 100%)',
                        }}
                      >
                        <i className="fa-solid fa-bag-shopping text-white"></i>
                      </div>
                      <div>
                        <h4 className="card-title mb-0 fw-bold" style={{ fontSize: '1.15rem' }}>Order Summary</h4>
                        <small className="text-muted">{cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in cart</small>
                      </div>
                    </div>
                  </div>

                  {/* Cart Items */}
                  <div className="mb-4">
                    {cartItems.map((item) => (
                      <div
                        key={item.id}
                        className="d-flex align-items-start gap-3 mb-3 pb-3"
                        style={{ borderBottom: '1px solid #f0f0f0' }}
                      >
                        <div
                          className="position-relative shrink-0"
                          style={{
                            width: '72px',
                            height: '72px',
                            borderRadius: '10px',
                            background: '#f8f8f8',
                            overflow: 'hidden',
                          }}
                        >
                          <img
                            src={asset(item.image)}
                            alt={item.title}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                          />
                          <span
                            className="position-absolute badge"
                            style={{
                              top: '4px',
                              right: '4px',
                              fontSize: '0.65rem',
                              background: 'rgba(0,0,0,0.65)',
                              borderRadius: '6px',
                              padding: '2px 6px',
                            }}
                          >
                            ×{item.quantity}
                          </span>
                        </div>
                        <div className="grow" style={{ minWidth: 0 }}>
                          <h6 className="mb-1 fw-semibold text-truncate" style={{ fontSize: '0.95rem' }}>
                            {item.title}
                          </h6>
                          {item.color && (
                            <p className="mb-1 small text-muted">
                              Color: <span className="fw-medium">{item.color}</span>
                            </p>
                          )}
                          <p className="mb-0 small text-muted">
                            ${item.price.toFixed(2)} each
                          </p>
                        </div>
                        <div className="text-end shrink-0">
                          <span className="fw-bold" style={{ fontSize: '0.95rem', color: '#1a1a1a' }}>
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div style={{ background: '#f8f8f8', borderRadius: '12px', padding: '1.25rem' }}>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-muted">Subtotal</span>
                      <span className="fw-medium">${cartTotal.toFixed(2)}</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-muted">Shipping</span>
                      <span className="text-success fw-medium">
                        <i className="fa-solid fa-truck me-1"></i>Free
                      </span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <span className="text-muted">Tax</span>
                      <span className="text-muted">Calculated at delivery</span>
                    </div>
                    <hr className="my-2" style={{ borderColor: '#e0e0e0' }} />
                    <div className="d-flex justify-content-between align-items-center pt-1">
                      <span className="fw-bold" style={{ fontSize: '1.1rem' }}>Total</span>
                      <span className="fw-bold" style={{ fontSize: '1.25rem', color: '#1B4D2E' }}>
                        ${cartTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Trust badges */}
                  <div className="d-flex justify-content-center gap-4 mt-4 text-muted">
                    <div className="text-center">
                      <i className="fa-solid fa-shield-halved mb-1 d-block" style={{ fontSize: '1.1rem', color: '#C9A24A' }}></i>
                      <small style={{ fontSize: '0.7rem' }}>Secure</small>
                    </div>
                    <div className="text-center">
                      <i className="fa-solid fa-rotate-left mb-1 d-block" style={{ fontSize: '1.1rem', color: '#C9A24A' }}></i>
                      <small style={{ fontSize: '0.7rem' }}>Easy Returns</small>
                    </div>
                    <div className="text-center">
                      <i className="fa-solid fa-headset mb-1 d-block" style={{ fontSize: '1.1rem', color: '#C9A24A' }}></i>
                      <small style={{ fontSize: '0.7rem' }}>24/7 Support</small>
                    </div>
                  </div>
                </div>
              </div>

              {/* Edit cart link */}
              <div className="text-center mt-3">
                <Link
                  to="/products"
                  className="text-decoration-none"
                  style={{ color: '#C9A24A', fontSize: '0.9rem', fontWeight: 500 }}
                >
                  <i className="fa-solid fa-arrow-left me-1"></i>
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
