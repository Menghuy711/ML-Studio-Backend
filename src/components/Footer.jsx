import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer-section">
      <div className="container">
        <div className="row gy-4">
          {/* Logo & Description */}
          <div className="col-lg-4">
            <Link to="/" className="footer-logo d-flex justify-content-center align-items-end" style={{ width: '200px', height: '90px' }}>
              <img src="/images/logo/ML Studio LOGO.png" alt="ML Studio Logo" />
            </Link>
            <p className="footer-text mt-3">
              Premium bags designed for modern lifestyles. Combining elegance, minimal style, and comfort in every situation.
            </p>
          </div>

          {/* Quick Links */}
          <div className="col-lg-4">
            <h5 className="footer-title">Quick Links</h5>
            <ul className="footer-links">
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/products">Products</Link>
              </li>
              <li>
                <Link to="/about">About Us</Link>
              </li>
              <li>
                <Link to="/contact">Contact</Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="col-lg-4">
            <h5 className="footer-title">Contact Info</h5>
            <p className="text-body">
              <i className="fa-solid fa-location-dot fa-lg"></i> Phnom Penh, Royal University of Phnom Penh
            </p>
            <p className="text-body">
              <i className="fa-solid fa-phone fa-lg"></i> +885 964 663 885
            </p>
            <p className="text-body">
              <i className="fa-solid fa-envelope fa-lg"></i> MLStudio@gmail.com
            </p>
          </div>
        </div>
        <hr />
        <div className="text-center pt-3">
          <p className="mb-0">© 2026 ML Studio. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
