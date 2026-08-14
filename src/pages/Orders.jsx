import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContextValues';
import { supabase } from '../lib/supabaseClient';
import { asset } from '../lib/asset';

export default function Orders() {
  const { user, loading: authLoading } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setLoading(false);
      return;
    }

    async function fetchOrders() {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        setOrders(data || []);
      }
      setLoading(false);
    }

    fetchOrders();
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <section className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading your orders...</p>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="container py-5 text-center">
        <h1 className="fw-bold mb-3">Order History</h1>
        <p className="lead">Please log in to view your orders.</p>
        <Link to="/products" className="btn gold-btn">
          Browse Products
        </Link>
      </section>
    );
  }

  if (error) {
    return (
      <section className="container py-5 text-center">
        <h1 className="fw-bold mb-3">Oops</h1>
        <p className="text-danger">{error}</p>
      </section>
    );
  }

  return (
    <section className="container py-5">
      <h1 className="fw-bold mb-4">Order History</h1>

      {orders.length === 0 ? (
        <div className="text-center py-5">
          <i className="fa-solid fa-box-open fa-3x text-muted mb-3"></i>
          <p className="lead">You haven't placed any orders yet.</p>
          <Link to="/products" className="btn gold-btn">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="row g-4">
          {orders.map((order) => (
            <div key={order.id} className="col-12">
              <div className="card shadow-sm">
                <div className="card-body">
                  <div className="d-flex flex-wrap justify-content-between align-items-center mb-3">
                    <div>
                      <h5 className="mb-1">Order #{order.id.slice(0, 8)}</h5>
                      <small className="text-muted">
                        {new Date(order.created_at).toLocaleString()}
                      </small>
                    </div>
                    <span
                      className={`badge ${
                        order.status === 'delivered'
                          ? 'bg-success'
                          : order.status === 'shipped'
                          ? 'bg-info text-dark'
                          : 'bg-warning text-dark'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <div className="table-responsive">
                    <table className="table table-sm table-borderless mb-0">
                      <tbody>
                        {(order.items || []).map((item, idx) => (
                          <tr key={idx}>
                            <td className="ps-0" style={{ width: '50px' }}>
                              <img
                                src={asset(item.image)}
                                alt={item.title}
                                className="rounded"
                                style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                              />
                            </td>
                            <td>{item.title}</td>
                            <td className="text-muted">× {item.quantity}</td>
                            <td className="text-end pe-0">${(item.price * item.quantity).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <hr />
                  <div className="d-flex justify-content-between">
                    <span className="fw-bold">Total</span>
                    <span className="fw-bold">${Number(order.total).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
