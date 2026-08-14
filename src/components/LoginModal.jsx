import { useContext, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContextValues';

export default function LoginModal({ activeModal, setActiveModal }) {
  const { signIn, signUp, resetPasswordForEmail } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || null;

  const isLoginOpen = activeModal === 'login';
  const isRegisterOpen = activeModal === 'register';
  const isForgotOpen = activeModal === 'forgot';

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ username: '', email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [registerMessage, setRegisterMessage] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleClose = () => {
    setActiveModal(null);
    setLoginError('');
    setRegisterError('');
    setRegisterMessage('');
    setForgotError('');
    setForgotMessage('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setSubmitting(true);

    const { error } = await signIn(loginForm.email, loginForm.password);

    setSubmitting(false);
    if (error) {
      setLoginError(error.message);
      return;
    }

    setLoginForm({ email: '', password: '' });
    handleClose();
    // Redirect back to the page the user tried to access before login
    if (redirectTo) {
      navigate(redirectTo, { replace: true });
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegisterError('');
    setRegisterMessage('');
    setSubmitting(true);

    const { data, error } = await signUp(
      registerForm.email,
      registerForm.password,
      registerForm.username
    );

    setSubmitting(false);
    if (error) {
      setRegisterError(error.message);
      return;
    }

    // If email confirmation is enabled in Supabase, there is no session yet
    if (!data.session) {
      setRegisterMessage('Account created! Please check your email to confirm before logging in.');
      return;
    }

    setRegisterForm({ username: '', email: '', password: '' });
    handleClose();
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotMessage('');
    setSubmitting(true);

    const { error } = await resetPasswordForEmail(forgotEmail);

    setSubmitting(false);
    if (error) {
      setForgotError(error.message);
      return;
    }

    // Always show a generic success message (don't reveal whether the account exists)
    setForgotMessage('If an account exists for that email, a password reset link has been sent. Please check your inbox.');
    setForgotEmail('');
  };

  const handleBackToLogin = () => {
    setForgotError('');
    setForgotMessage('');
    setActiveModal('login');
  };

  return (
    <>
      {/* Login/Register/Forgot checkboxes & modals (must be siblings for CSS ~ selector) */}
      <input type="checkbox" id="login-toggle" checked={isLoginOpen} readOnly style={{ display: 'none' }} />
      <input type="checkbox" id="register-toggle" checked={isRegisterOpen} readOnly style={{ display: 'none' }} />
      <input type="checkbox" id="forgot-toggle" checked={isForgotOpen} readOnly style={{ display: 'none' }} />

      {/* Login Overlay + Modal */}
      <div className="modal-overlay login-overlay">
        <label onClick={handleClose} style={{ position: 'absolute', inset: '0', cursor: 'default' }} aria-label="Close"></label>

        <div className="modal-card">
          {/* Left */}
          <div className="modal-left">
            <h2>Hello,<br />Welcome!</h2>
            <p>Don't have an account?</p>
            <a href="#" className="btn-register-link" onClick={(e) => { e.preventDefault(); setActiveModal('register'); }}>
              Register
            </a>
          </div>

          {/* Right */}
          <div className="modal-right">
            <label className="btn-close-modal" onClick={handleClose} aria-label="Close">
              <i className="bi bi-x-lg"></i>
            </label>

            <h3>Login</h3>

            <form onSubmit={handleLoginSubmit}>
              <div className="field-wrap">
                <input
                  type="email"
                  placeholder="Email"
                  autoComplete="email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  required
                />
                <i className="bi bi-person field-icon"></i>
              </div>

              <div className="field-wrap">
                <input
                  type="password"
                  placeholder="Password"
                  autoComplete="current-password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  required
                />
                <i className="bi bi-lock field-icon"></i>
              </div>

              {loginError && <p className="text-danger small mb-3">{loginError}</p>}

              <a
                href="#"
                className="forgot-link"
                onClick={(e) => {
                  e.preventDefault();
                  setLoginError('');
                  setActiveModal('forgot');
                }}
              >
                Forgot password?
              </a>

              <button className="btn-login" type="submit" disabled={submitting}>
                {submitting ? 'Logging in...' : 'Login'}
              </button>
            </form>


          </div>
        </div>
      </div>

      {/* Register Overlay + Modal */}
      <div className="modal-overlay register-overlay">
        <label onClick={handleClose} style={{ position: 'absolute', inset: '0', cursor: 'default' }} aria-label="Close"></label>

        <div className="modal-card">
          {/* Left */}
          <div className="modal-left">
            <h2>Join Us<br />Today!</h2>
            <p>Already have an account?</p>
            <a href="#" className="btn-register-link" onClick={(e) => { e.preventDefault(); setActiveModal('login'); }}>
              Login
            </a>
          </div>

          {/* Right */}
          <div className="modal-right">
            <label className="btn-close-modal" onClick={handleClose} aria-label="Close">
              <i className="bi bi-x-lg"></i>
            </label>

            <h3>Register</h3>

            <form onSubmit={handleRegisterSubmit}>
              <div className="field-wrap">
                <input
                  type="text"
                  placeholder="Username"
                  autoComplete="username"
                  value={registerForm.username}
                  onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                  required
                />
                <i className="bi bi-at field-icon"></i>
              </div>

              <div className="field-wrap">
                <input
                  type="email"
                  placeholder="Email Address"
                  autoComplete="email"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                  required
                />
                <i className="bi bi-envelope field-icon"></i>
              </div>

              <div className="field-wrap">
                <input
                  type="password"
                  placeholder="Password"
                  autoComplete="new-password"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                  required
                  minLength={6}
                />
                <i className="bi bi-lock field-icon"></i>
              </div>

              {registerError && <p className="text-danger small mb-3">{registerError}</p>}
              {registerMessage && <p className="text-success small mb-3">{registerMessage}</p>}

              <button className="btn-register" type="submit" disabled={submitting}>
                {submitting ? 'Creating account...' : 'Create Account'}
              </button>
            </form>


          </div>
        </div>
      </div>

      {/* Forgot Password Overlay + Modal */}
      <div className="modal-overlay forgot-overlay">
        <label onClick={handleClose} style={{ position: 'absolute', inset: '0', cursor: 'default' }} aria-label="Close"></label>

        <div className="modal-card">
          {/* Left */}
          <div className="modal-left">
            <h2>Reset<br />Password</h2>
            <p>Enter your email and we'll send you a link to reset your password.</p>
            <a href="#" className="btn-register-link" onClick={(e) => { e.preventDefault(); handleBackToLogin(); }}>
              Back to Login
            </a>
          </div>

          {/* Right */}
          <div className="modal-right">
            <label className="btn-close-modal" onClick={handleClose} aria-label="Close">
              <i className="bi bi-x-lg"></i>
            </label>

            <h3>Forgot Password</h3>

            {forgotMessage ? (
              <div className="text-center">
                <p className="text-success small mb-4">{forgotMessage}</p>
                <button className="btn-login" type="button" onClick={handleBackToLogin}>
                  Back to Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit}>
                <div className="field-wrap">
                  <input
                    type="email"
                    placeholder="Email"
                    autoComplete="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                  />
                  <i className="bi bi-envelope field-icon"></i>
                </div>

                {forgotError && <p className="text-danger small mb-3">{forgotError}</p>}

                <button className="btn-login" type="submit" disabled={submitting}>
                  {submitting ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
