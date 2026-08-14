import { Link } from 'react-router-dom';
import { useContext, useEffect, useState } from 'react';
import { CartContext } from '../context/CartContextValues';
import { AuthContext } from '../context/AuthContextValues';
import { LayoutContext } from '../context/LayoutContextValues';
import { supabase } from '../lib/supabaseClient';
import { asset } from '../lib/asset';

export default function Products() {
  const { addToCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const { showAuthToast } = useContext(LayoutContext);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const categoryAnchors = {
    'Backpacks':            'backpacks',
    'Luggage':              'luggage',
    'Travel Bags':          'travelbag',
    'Sling & Crossbody Bags': 'sling',
    'Duffel Bags':          'duffel',
    'Tote Bags':            'totes',
    'Accessories':          'accessories',
  };

  useEffect(() => {
    async function fetchProducts() {
      const { data } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: true });
      if (data) {
        setProducts(data);
        // Derive categories in original order, preserving known order
        const seen = new Set();
        const cats = data
          .map((p) => p.category)
          .filter((c) => { if (seen.has(c)) return false; seen.add(c); return true; });
        setCategories(cats);
      }
      setLoading(false);
    }
    fetchProducts();
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
      {/* banner product */}
      <section className="product-hero">
        <div className="container text-center">
          <h1 className="display-3 fw-bold">Our Collection</h1>
          <p className="lead">{products.length}+ Premium Bags Available</p>
        </div>
      </section>

      {/* SECTION */}
      <section className="products-section py-5">
        <div className="container">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border" style={{ color: '#c9a84c' }} role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            <>
              {/* Category Links */}
              <div className="text-center mb-5">
                {categories.map((cat) => (
                  <a
                    key={cat}
                    href={`#${categoryAnchors[cat] || cat.toLowerCase().replace(/\s+/g, '-')}`}
                    className="btn green-btn m-1"
                  >
                    {cat}
                  </a>
                ))}
              </div>

              <div className="row g-4">
                {categories.map((category) => (
                  <div key={category} className="col-12">
                    <h2
                      className="section-title mb-4"
                      id={categoryAnchors[category] || category.toLowerCase().replace(/\s+/g, '-')}
                    >
                      {category}
                    </h2>
                    <div className="row g-4">
                      {products
                        .filter((p) => p.category === category)
                        .map((product) => (
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
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
