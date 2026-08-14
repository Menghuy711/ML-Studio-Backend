import { Link } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import { CartContext } from '../context/CartContextValues';
import { AuthContext } from '../context/AuthContextValues';
import { LayoutContext } from '../context/LayoutContextValues';
import { supabase } from '../lib/supabaseClient';
import { asset } from '../lib/asset';

// Featured product IDs — easy to swap without touching JSX
const featuredIds = [
  'carryology-essentials-sling',
  'lite-carry-on',
  'road-trip-travel-set',
  'weekender-duffel',
  'tech-organizer-pouch',
  'minimalist-wallet',
];

export default function Home() {
  const { addToCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const { showAuthToast } = useContext(LayoutContext);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    async function fetchFeatured() {
      const { data } = await supabase
        .from('products')
        .select('*')
        .in('id', featuredIds);
      if (data) {
        // Preserve the original display order
        const ordered = featuredIds
          .map((id) => data.find((p) => p.id === id))
          .filter(Boolean);
        setFeaturedProducts(ordered);
      }
      setLoadingProducts(false);
    }
    fetchFeatured();
  }, []);

  const handleAddToCart = (product) => {
    if (!user) {
      showAuthToast();
      return;
    }
    addToCart({
      id: product.id,
      title: product.name,
      price: product.price,
      image: product.image_url,
    });
  };

  return (
    <>
      {/* HERO Section */}
      <section className="hero">
        <div className="container">
          <div className="row align-items-center min-vh-100">
            <div className="col-md-6">
              <h1 className="display-4 fw-bold">Luxury Bags Collection</h1>
              <p className="lead">Premium Collections Made For Modern Lifestyle</p>
              <Link to="/products" className="btn gold-btn btn-lg">Shop Now</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="featured-products py-5">
        <div className="container">
          <h2 className="text-center mb-5">Featured Bags</h2>
          {loadingProducts ? (
            <div className="text-center py-5">
              <div className="spinner-border" style={{ color: '#c9a84c' }} role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <div className="row g-3">
              {featuredProducts.map((product) => (
                <div key={product.id} className="col-md-6 col-lg-4">
                  <div className="card product-card h-100">
                    <div
                      style={{
                        height: '260px',
                        background: '#f5f5f5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        borderRadius: '8px 8px 0 0',
                      }}
                    >
                      <img
                        src={asset(product.image_url)}
                        className="card-img-top"
                        alt={product.name}
                        style={{
                          maxHeight: '240px',
                          width: '100%',
                          objectFit: 'contain',
                          objectPosition: 'center',
                          padding: '12px',
                        }}
                      />
                    </div>
                    <div className="card-body">
                      <span className={`badge ${product.badge_class} mb-2`}>
                        {product.badge}
                      </span>
                      <h5 className="card-title">{product.name}</h5>
                      <p className="card-text">{product.description}</p>
                      <h4 className="price">${product.price}</h4>
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-outline-dark w-50"
                          onClick={() => handleAddToCart(product)}
                        >
                          <i className="fa-solid fa-cart-plus"></i> Add
                        </button>
                        <Link
                          to={`/products/${product.id}`}
                          className="btn gold-btn w-50"
                        >
                          Details
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-5" style={{ backgroundColor: '#10361F', color: 'white' }}>
        <div className="container">
          <div className="row text-center">
            <div className="col-md-4 mb-4">
              <h4>Premium Quality</h4>
              <p>High-quality materials and craftsmanship.</p>
            </div>
            <div className="col-md-4 mb-4">
              <h4>Free Shipping</h4>
              <p>Fast and reliable delivery service.</p>
            </div>
            <div className="col-md-4 mb-4">
              <h4>Secure Payment</h4>
              <p>Safe and trusted payment methods.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Reviews */}
      <section className="testimonials py-5">
        <div className="container">
          <h2 className="text-center mb-5">What Our Customers Say</h2>
          <div className="row">
            <div className="col-md-4 mb-4">
              <div className="card testimonial-card h-100">
                <div className="card-body text-center">
                  <i className="fa-solid fa-star fa-lg" style={{ color: 'rgb(255, 212, 59)' }}></i>
                  <i className="fa-solid fa-star fa-lg" style={{ color: 'rgb(255, 212, 59)' }}></i>
                  <i className="fa-solid fa-star fa-lg" style={{ color: 'rgb(255, 212, 59)' }}></i>
                  <i className="fa-solid fa-star fa-lg" style={{ color: 'rgb(255, 212, 59)' }}></i>
                  <i className="fa-solid fa-star fa-lg" style={{ color: 'rgb(255, 212, 59)' }}></i>
                  <p className="pt-3">"Excellent quality and very stylish bags. Highly recommended!"</p>
                  <h6>- Lor Menghuy</h6>
                </div>
              </div>
            </div>

            <div className="col-md-4 mb-4">
              <div className="card testimonial-card h-100">
                <div className="card-body text-center">
                  <i className="fa-solid fa-star fa-lg" style={{ color: 'rgb(255, 212, 59)' }}></i>
                  <i className="fa-solid fa-star fa-lg" style={{ color: 'rgb(255, 212, 59)' }}></i>
                  <i className="fa-solid fa-star fa-lg" style={{ color: 'rgb(255, 212, 59)' }}></i>
                  <i className="fa-solid fa-star fa-lg" style={{ color: 'rgb(255, 212, 59)' }}></i>
                  <i className="fa-solid fa-star fa-lg" style={{ color: 'rgb(255, 212, 59)' }}></i>
                  <p className="pt-3">"Fast delivery and good customer service."</p>
                  <h6>- Peter Parker</h6>
                </div>
              </div>
            </div>

            <div className="col-md-4 mb-4">
              <div className="card testimonial-card h-100">
                <div className="card-body text-center">
                  <i className="fa-solid fa-star fa-lg" style={{ color: 'rgb(255, 212, 59)' }}></i>
                  <i className="fa-solid fa-star fa-lg" style={{ color: 'rgb(255, 212, 59)' }}></i>
                  <i className="fa-solid fa-star fa-lg" style={{ color: 'rgb(255, 212, 59)' }}></i>
                  <i className="fa-solid fa-star fa-lg" style={{ color: 'rgb(255, 212, 59)' }}></i>
                  <i className="fa-solid fa-star-half fa-lg" style={{ color: 'rgb(255, 212, 59)' }}></i>
                  <p className="pt-3">"The best bag store I've found online!"</p>
                  <h6>- Chhim BunChhun</h6>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
