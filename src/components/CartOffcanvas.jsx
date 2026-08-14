import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContextValues';
import { AuthContext } from '../context/AuthContextValues';
import { LayoutContext } from '../context/LayoutContextValues';
import { asset } from '../lib/asset';

export default function CartOffcanvas() {
  const { cartItems, removeFromCart, updateQuantity, cartTotal } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const { showAuthToast } = useContext(LayoutContext);
  const navigate = useNavigate();

  const handleCheckout = () => {
    const offcanvasEl = document.getElementById('cartOffcanvas');
    if (offcanvasEl && window.bootstrap?.Offcanvas) {
      const offcanvas = window.bootstrap.Offcanvas.getInstance(offcanvasEl);
      if (offcanvas) offcanvas.hide();
    }

    if (!user) {
      showAuthToast();
      return;
    }
    navigate('/checkout');
  };

  return (
    <div
      className="offcanvas offcanvas-end"
      tabIndex="-1"
      id="cartOffcanvas"
      aria-labelledby="cartOffcanvasLabel"
    >
      <div className="offcanvas-header border-bottom">
        <h5 className="offcanvas-title fw-bold" id="cartOffcanvasLabel">
          Your Cart
        </h5>
        <button
          type="button"
          className="btn-close text-reset"
          data-bs-dismiss="offcanvas"
          aria-label="Close"
        ></button>
      </div>
      <div className="offcanvas-body d-flex flex-column">
        {cartItems.length === 0 ? (
          <div className="text-center my-5 text-muted">
            <i className="fa-solid fa-cart-arrow-down fa-3x mb-3"></i>
            <p>Your cart is currently empty.</p>
          </div>
        ) : (
          <div className="grow overflow-auto">
            {cartItems.map((item) => (
              <div key={item.id} className="d-flex align-items-center mb-3 pb-3 border-bottom">
                <img
                  src={asset(item.image)}
                  alt={item.title}
                  className="img-fluid rounded"
                  style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                />
                <div className="ms-3 grow">
                  <h6 className="mb-0">{item.title}</h6>
                  <p className="mb-0 text-muted">${item.price.toFixed(2)}</p>
                  
                  <div className="d-flex align-items-center mt-2">
                    <div className="btn-group btn-group-sm" role="group">
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => updateQuantity(item, -1)}
                      >
                        -
                      </button>
                      <button type="button" className="btn btn-outline-secondary" disabled>
                        {item.quantity}
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => updateQuantity(item, 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  className="btn btn-sm btn-outline-danger ms-2"
                  onClick={() => removeFromCart(item)}
                >
                  <i className="fa-solid fa-trash"></i>
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-auto border-top pt-3">
          <div className="d-flex justify-content-between mb-3">
            <h5 className="mb-0 fw-bold">Total</h5>
            <h5 className="mb-0 fw-bold">${cartTotal.toFixed(2)}</h5>
          </div>
          <button
            className="btn gold-btn w-100 py-2 fw-bold"
            disabled={cartItems.length === 0}
            onClick={handleCheckout}
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
