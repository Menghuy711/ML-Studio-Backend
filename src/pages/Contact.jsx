import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!form.name || !form.email || !form.message) {
      setError('Please fill in all fields.');
      return;
    }

    setSubmitting(true);

    const { error: insertError } = await supabase
      .from('contact_messages')
      .insert({
        name: form.name,
        email: form.email,
        message: form.message,
      });

    setSubmitting(false);

    if (insertError) {
      setError(insertError.message || 'Failed to send message. Please try again.');
      return;
    }

    setSuccess(true);
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <>
      {/* Contact hero */}
      <section className="contact-hero">
        <div className="container text-center">
          <h1 className="display-3 fw-bold">Contact Us</h1>
          <p>We would love to hear from you.</p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-5">
        <div className="container">
          <div className="row">
            {/* Contact Info */}
            <div className="col-md-5">
              <div className="contact-info">
                <h3>Contact Information</h3>
                <div className="mt-5">
                  <p className="text-dark-emphasis">
                    <i className="fa-solid fa-envelope fa-lg"></i> MLStudio@gmail.com
                  </p>
                  <p className="text-dark-emphasis">
                    <i className="fa-solid fa-phone fa-lg"></i> +885 964 663 885
                  </p>
                  <p className="text-dark-emphasis">
                    <i className="fa-solid fa-location-dot fa-lg"></i> Phnom Penh, Royal University of Phnom Penh
                  </p>
                  <a href="https://www.facebook.com/share/1CQzPW6V7c/?mibextid=wwXIfr" className="text-decoration-none text-dark-emphasis">
                    <p><i className="fa-brands fa-facebook fa-lg"></i> ML Studio</p>
                  </a>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="col-md-7">
              <form className="contact-form" onSubmit={handleSubmit}>
                {success && (
                  <div className="alert alert-success">
                    <i className="fa-solid fa-check-circle me-2"></i>
                    Message sent successfully! We'll get back to you soon.
                  </div>
                )}
                {error && <div className="alert alert-danger">{error}</div>}

                <div className="mb-3">
                  <label htmlFor="contact-name" className="form-label">Your Name</label>
                  <input
                    type="text"
                    id="contact-name"
                    name="name"
                    className="form-control"
                    placeholder="Your Name"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="contact-email" className="form-label">Your Email</label>
                  <input
                    type="email"
                    id="contact-email"
                    name="email"
                    className="form-control"
                    placeholder="Your Email"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="contact-message" className="form-label">Your Message</label>
                  <textarea
                    id="contact-message"
                    name="message"
                    className="form-control"
                    rows="5"
                    placeholder="Your Message"
                    value={form.message}
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>
                <button className="btn green-btn" type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Sending...
                    </>
                  ) : (
                    'Send Message'
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Map Placeholder */}
      <section className="py-5 bg-light">
        <div className="container">
          <h2 className="text-center mb-4">Find Us</h2>
          <div className="map-container">
            <iframe 
              title="ML Studio Store Location Map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3420.169362613799!2d104.88875847440178!3d11.568698238632345!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3109519fe4077d69%3A0x20138e822e434660!2sRoyal%20University%20of%20Phnom%20Penh!5e1!3m2!1sen!2skh!4v1781354248026!5m2!1sen!2skh"
              width="1100" 
              height="450" 
              style={{ border: 0 }} 
              allowFullScreen=""
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade">
            </iframe>
          </div>
        </div>
      </section>
    </>
  );
}
