import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { usePageTitle } from '../hooks/usePageTitle';
import styles from '../styles/RegisterPage.module.css';

export default function RegisterPage() {
  usePageTitle('Register — Nonogram');
  const navigate = useNavigate();
  const { register, loginWithGoogle, loading, supportsGoogle } = useAuth();
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const validate = (): string | null => {
    const trimmedUsername = username.trim();
    if (!trimmedUsername) return 'Email is required.';
    if (password.length < 4) return 'Password must be at least 4 characters.';
    if (password !== confirmPassword) return 'Passwords do not match.';
    return null;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      await register(username.trim(), password, displayName.trim() || undefined);
      navigate('/');
    } catch (err) {
      if (err instanceof Error && err.message === 'Username already taken') {
        setError('Email already in use');
      } else {
        setError('Registration failed. Please try again.');
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    try {
      await loginWithGoogle();
      navigate('/');
    } catch {
      setError('Google sign-in failed. Please try again.');
    }
  };

  const isFormValid =
    username.trim().length > 0 &&
    password.length >= 4 &&
    password === confirmPassword;

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Register</h1>
        <p className={styles.subtitle}>Create your Nonogram account</p>

        {supportsGoogle && (
          <>
            <button
              type="button"
              className={styles.googleButton}
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              <svg className={styles.googleIcon} viewBox="0 0 24 24" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              {loading ? 'Signing in…' : 'Sign up with Google'}
            </button>
            <div className={styles.divider}>
              <span className={styles.dividerText}>or</span>
            </div>
          </>
        )}

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="username">
              Email
            </label>
            <input
              id="username"
              className={styles.input}
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose an email"
              required
              autoFocus
              autoComplete="username"
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="displayName">
              Display Name <span style={{ opacity: 0.5 }}>(optional)</span>
            </label>
            <input
              id="displayName"
              className={styles.input}
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={username || 'Defaults to email'}
              autoComplete="name"
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="password">
              Password
            </label>
            <input
              id="password"
              className={styles.input}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 4 characters"
              required
              minLength={4}
              autoComplete="new-password"
            />
          </div>

          <div className={styles.fieldGroup}>
            <label className={styles.label} htmlFor="confirmPassword">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              className={styles.input}
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              required
              autoComplete="new-password"
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading || !isFormValid}
          >
            {loading ? 'Creating account…' : 'Register'}
          </button>
        </form>

        <p className={styles.switchLink}>
          Already have an account?{' '}
          <Link to="/login" className={styles.link}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
