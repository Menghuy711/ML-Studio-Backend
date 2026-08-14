import { useParams, Link } from 'react-router-dom';
import { useContext, useState, useEffect } from 'react';
import { CartContext } from '../context/CartContextValues';
import { AuthContext } from '../context/AuthContextValues';
import { LayoutContext } from '../context/LayoutContextValues';
import { supabase } from '../lib/supabaseClient';

export default function ProductDetails() {
  const { id } = useParams();
  const { addToCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const { showAuthToast } = useContext(LayoutContext);

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState(null);

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (data) {
        setProduct(data);
        const colors = data.colors || [];
        setSelectedColor(colors.length ? colors[0] : null);

        // Fetch related products (same category, exclude current)
        const { data: related } = await supabase
          .from('products')
          .select('*')
          .eq('category', data.category)
          .neq('id', id)
          .limit(3);
        setRelatedProducts(related || []);
      }
      setLoading(false);
    }
    fetchProduct();
  }, [id]);

  // Reset selected color when navigating between products
  useEffect(() => {
    if (product) {
      const colors = product.colors || [];
      setSelectedColor(colors.length ? colors[0] : null);
    }
  }, [product]);

  const mainImage = selectedColor?.image || product?.image_url;

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (!product) return;
    if (!user) {
      showAuthToast();
      return;
    }
    addToCart({
      id: product.id,
      title: product.name,
      price: product.price,
      image: selectedColor?.image || product.image_url,
      color: selectedColor?.name,
    });
    const offcanvasEl = document.getElementById('cartOffcanvas');
    if (offcanvasEl && window.bootstrap?.Offcanvas) {
      const offcanvas = window.bootstrap.Offcanvas.getOrCreateInstance(offcanvasEl);
      offcanvas.show();
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border" style={{ color: '#c9a84c' }} role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <section className="container py-5 text-center">
        <h1 className="fw-bold mb-3">Product Not Found</h1>
        <p className="lead">Sorry, we could not find the product you are looking for.</p>
        <Link to="/products" className="btn gold-btn">
          Back to Products
        </Link>
      </section>
    );
  }

  return (
    <>
      {/* Product detail */}
      <section className="container py-5">
        {/* Back to Products */}
        <div className="mb-4">
          <Link to="/products" className="btn gold-btn">
            ← Back to Products
          </Link>
        </div>

        <div className="row g-4 g-md-5 g-lg-5">
          {/* Product Image */}
          <div className="col-lg-6">
            <div
              style={{
                background: '#f5f5f5',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '420px',
                padding: '24px',
                boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
              }}
            >
              <img
                src={mainImage}
                className="img-fluid"
                alt={product.name}
                style={{
                  maxHeight: '420px',
                  width: '100%',
                  objectFit: 'contain',
                  objectPosition: 'center',
                }}
              />
            </div>
          </div>

          {/* Product Information */}
          <div className="col-lg-6">
            <h1 className="fw-bold mb-3">{product.name}</h1>
            <h3 className="text-danger mb-4">${Number(product.price).toFixed(2)}</h3>

            {/* Color selector */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-4">
                <p className="mb-2 fw-semibold">
                  Color: <span className="fw-normal text-muted">{selectedColor?.name}</span>
                </p>
                <div className="d-flex gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color.name}
                      type="button"
                      className={`btn p-1 rounded-circle ${
                        selectedColor?.name === color.name
                          ? 'border-3 border-dark'
                          : 'border-2 border-light'
                      }`}
                      style={{
                        width: '36px',
                        height: '36px',
                        backgroundColor: color.hex,
                      }}
                      onClick={() => setSelectedColor(color)}
                      aria-label={`Select ${color.name}`}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            )}

            <p className="lead">{product.description}</p>

            {product.features && product.features.length > 0 && (
              <>
                <h5 className="mt-4">Features</h5>
                <ul>
                  {product.features.map((feature, idx) => (
                    <li key={idx}>{feature}</li>
                  ))}
                </ul>
              </>
            )}

            <button
              type="button"
              className="btn green-btn btn-lg mt-3"
              onClick={handleAddToCart}
            >
              Add To Cart
            </button>
          </div>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="container py-5">
          <h2 className="text-center mb-5">Related Products</h2>
          <div className="row g-4">
            {relatedProducts.map((rp) => (
              <div key={rp.id} className="col-md-4">
                <Link to={`/products/${rp.id}`} className="text-decoration-none text-dark">
                  <div className="card h-100">
                    <div
                      style={{
                        height: '200px',
                        background: '#f5f5f5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        borderRadius: '8px 8px 0 0',
                        padding: '12px',
                      }}
                    >
                      <img
                        src={rp.image_url}
                        className="card-img-top"
                        alt={rp.name}
                        style={{
                          maxHeight: '180px',
                          width: '100%',
                          objectFit: 'contain',
                          objectPosition: 'center',
                        }}
                      />
                    </div>
                    <div className="card-body">
                      <h5>{rp.name}</h5>
                      <p className="text-muted mb-0">${Number(rp.price).toFixed(2)}</p>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
