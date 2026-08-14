import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { AuthContext } from '../context/AuthContextValues';

export default function ResetPassword() {
  const { updatePassword } = useContext(AuthContext);
  const navigate = useNavigate();

  const [hasRecoveryToken, setHasRecoveryToken] = useState(false);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Supabase puts the recovery tokens in the URL hash (#access_token=...&type=recovery).
    // The client picks these up automatically, but we also parse them manually as a fallback.
    const hashParams = new URLSearchParams(window.location.hash.slice(1));
    const type = hashParams.get('type');
    const accessToken = hashParams.get('access_token');

    const handleRecovery = () => {
      setHasRecoveryToken(true);
      setChecking(false);
      // Remove the tokens from the URL so a refresh doesn't re-trigger the flow
      window.history.replaceState({}, document.title, window.location.pathname);
    };

    if (accessToken && type === 'recovery') {
      handleRecovery();
      return;
    }

    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        handleRecovery();
      }
    });

    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);

    const { error: updateError } = await updatePassword(password);

    setSubmitting(false);

    if (updateError) {
      setError(updateError.message || 'Failed to update password. The link may have expired.');
      return;
    }

    setSuccess(true);
    setPassword('');
    setConfirm('');
  };

  const goToHome = async () => {
    await supabase.auth.signOut();
    navigate('/', { replace: true });
  };

  return (
    <div className="container py-5" style={{ minHeight: '60vh' }}>
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card border-0 shadow-sm rounded-4 p-4">
            {checking && (
              <div className="text-center py-5">
                <div className="spinner-border text-secondary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            )}

            {!checking && !hasRecoveryToken && (
              <div className="text-center py-4">
                <h3 className="fw-bold mb-3">Invalid or Expired Link</h3>
                <p className="text-muted mb-4">
                  This password reset link is invalid or has expired. Please request a new one.
                </p>
                <button className="btn btn-dark rounded-pill px-4" onClick={goToHome}>
                  Go to Login
                </button>
              </div>
            )}

            {!checking && hasRecoveryToken && !success && (
              <>
                <h3 className="fw-bold text-center mb-4">Set New Password</h3>
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="new-password" className="form-label">New Password</label>
                    <input
                      type="password"
                      id="new-password"
                      className="form-control"
                      placeholder="At least 6 characters"
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="confirm-password" className="form-label">Confirm Password</label>
                    <input
                      type="password"
                      id="confirm-password"
                      className="form-control"
                      placeholder="Re-enter your new password"
                      autoComplete="new-password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      required
                    />
                  </div>

                  {error && <div className="alert alert-danger py-2 small">{error}</div>}

                  <button
                    className="btn btn-warning w-100 fw-bold text-white mt-2"
                    style={{ background: 'linear-gradient(90deg, #c9a84c, #9a7320)', border: 'none' }}
                    type="submit"
                    disabled={submitting}
                  >
                    {submitting ? 'Updating...' : 'Update Password'}
                  </button>
                </form>
              </>
            )}

            {!checking && hasRecoveryToken && success && (
              <div className="text-center py-4">
                <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '3rem' }}></i>
                <h3 className="fw-bold mt-3 mb-3">Password Updated!</h3>
                <p className="text-muted mb-4">Your password has been reset successfully. You can now log in with your new password.</p>
                <button className="btn btn-dark rounded-pill px-4" onClick={goToHome}>
                  Go to Login
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
