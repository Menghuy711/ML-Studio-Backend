import { Link, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { CartContext } from '../context/CartContextValues';
import { AuthContext } from '../context/AuthContextValues';
import { asset } from '../lib/asset';

export default function Navbar({ onOpenLogin, onOpenRegister }) {
  const location = useLocation();
  const path = location.pathname;
  const { cartCount } = useContext(CartContext);
  const { user, isAdmin, signOut } = useContext(AuthContext);

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm sticky-top">
      <div className="container">
        {/* Logo */}
        <Link className="navbar-brand d-flex justify-content-center align-items-center" to="/"
          style={{ width: '200px', height: '90px' }}>
          <img src={asset('/images/logo/ML Studio LOGO.png')} alt="logo-ml-studio" />
        </Link>

        {/* Mobile: Cart + Toggle grouped together */}
        <div className="d-flex align-items-center d-lg-none">
          {/* Cart Icon (always visible on mobile) */}
          <button
            className="btn btn-link text-dark position-relative navbar-cart-btn"
            data-bs-toggle="offcanvas"
            data-bs-target="#cartOffcanvas"
            aria-controls="cartOffcanvas"
            style={{ textDecoration: 'none' }}
          >
            <i className="fa-solid fa-cart-shopping fa-lg"></i>
            {cartCount > 0 && (
              <span className="position-absolute top-25 start-75 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.65rem' }}>
                {cartCount}
                <span className="visually-hidden">items in cart</span>
              </span>
            )}
          </button>

          {/* Mobile Toggle Button */}
          <button className="navbar-toggler ms-2" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>
        </div>

        {/* Menu Items */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className={`nav-link ${path === '/' ? 'active' : ''}`} to="/">Home</Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${path.startsWith('/products') ? 'active' : ''}`} to="/products">Product</Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${path === '/about' ? 'active' : ''}`} to="/about">About</Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link ${path === '/contact' ? 'active' : ''}`} to="/contact">Contact</Link>
            </li>
            {user && (
              <li className="nav-item">
                <Link className={`nav-link ${path === '/orders' ? 'active' : ''}`} to="/orders">Orders</Link>
              </li>
            )}
            {isAdmin && (
              <li className="nav-item">
                <Link className={`nav-link ${path.startsWith('/admin') ? 'active' : ''}`} to="/admin">Admin</Link>
              </li>
            )}
          </ul>

          {/* Login and Register Button */}
          {user ? (
            <div className="navbar-auth-section d-flex align-items-center ms-lg-5">
              <span className="me-3">
                <i className="bi bi-person-circle me-1"></i>
                {user.user_metadata?.username || user.email}
              </span>
              <button
                className="btn btn-sm btn-outline-dark"
                onClick={async () => {
                  const { error } = await signOut();
                  if (error) console.error('Error signing out:', error);
                }}
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="navbar-auth-section d-flex align-items-center ms-lg-5">
              {/* Login button */}
              <button type="button" className="btn btn-link btn-open-login" onClick={onOpenLogin} style={{ textDecoration: 'none' }}>Login</button>

              {/* Line separator (desktop only) */}
              <div className="nav-separator d-none d-lg-block"></div>

              {/* Register button */}
              <button type="button" className="btn btn-link btn-open-register" onClick={onOpenRegister} style={{ textDecoration: 'none' }}>Register</button>
            </div>
          )}

          {/* Cart Icon (desktop only — mobile one is outside collapse) */}
          <button
            className="btn btn-link text-dark ms-3 position-relative d-none d-lg-inline-flex"
            data-bs-toggle="offcanvas"
            data-bs-target="#cartOffcanvas"
            aria-controls="cartOffcanvas"
            style={{ textDecoration: 'none' }}
          >
            <i className="fa-solid fa-cart-shopping fa-lg"></i>
            {cartCount > 0 && (
              <span className="position-absolute top-25 start-75 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.65rem' }}>
                {cartCount}
                <span className="visually-hidden">items in cart</span>
              </span>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}
