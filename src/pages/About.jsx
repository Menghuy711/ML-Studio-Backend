import { asset } from '../lib/asset';

export default function About() {
  return (
    <>
      {/* ABOUT Section */}
      <section className="about-hero">
        <div className="container text-center">
          <h1 className="display-3 fw-bold">About ML Studio</h1>
          <p className="lead">Crafted for Style. Designed for Everyday Adventure.</p>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-5">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <img
                src={asset('/images/IMG_0494.JPG')}
                className="img-fluid rounded-4 shadow"
                alt="Our Story"
              />
            </div>
            <div className="col-lg-6">
              <h2 className="fw-bold mb-5 mb-lg-5 mb-md-5 mt-3 mt-md-3 mt-lg-0">
                Our Story
              </h2>
              <p>
                ML Studio was founded with a simple mission: to create stylish, comfort, 
                and premium bags for modern lifestyles.
              </p>
              <p>
                Our journey began with a vision to bridge the gap between everyday 
                functionality and timeless comfy. We believe that a great bag is more 
                than just an accessory—it is a companion for your daily adventures, a statement 
                of your personal style, and a reliable partner through life's moments.
              </p>
              <p>
                Every collection we create combines carefully selected, high-quality materials, 
                functional design, and timeless elegance. From concept to final stitch, we pour 
                craftsmanship into every detail to ensure that our pieces don't just look beautiful, 
                but stand the test of time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission / Vision Cards */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="row text-center">
            <div className="col-md-4">
              <div className="info-card">
                <img 
                  src={asset('/images/cambodia-flag.avif')} 
                  alt="Designed in Cambodia" 
                  style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    marginBottom: '20px'
                  }} 
                />
                <h4>Designed in Cambodia</h4>
                <p>
                  We are a design-obsessed brand based in Phnom Penh, 
                  but our products are carried right across the globe.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="info-card">
                <img 
                  src={asset('/images/Making product last.jpg')} 
                  alt="Making products that last" 
                  style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    marginBottom: '20px'
                  }} 
                />
                <h4>Making products that last</h4>
                <p>
                  We're committed to making products that can be used and loved 
                  for as long as possible.
                </p>
              </div>
            </div>

            <div className="col-md-4">
              <div className="info-card">
                <img 
                  src={asset('/images/recycle.avif')} 
                  alt="Recycled Materials" 
                  style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    marginBottom: '20px'
                  }} 
                />
                <h4>Recycled Materials</h4>
                <p>
                  We're recognized for using business as a force for good. 
                  Which includes our development of recycled materials.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="stats-section text-center" style={{ backgroundColor: '#10361F' }}>
        <div className="container">
          <div className="row">
            <div className="col-md-4">
              <h2>100+</h2>
              <p>Happy Customers</p>
            </div>
            <div className="col-md-4">
              <h2>10+</h2>
              <p>Bag Designs</p>
            </div>
            <div className="col-md-4">
              <h2>2+</h2>
              <p>Years Experience</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
