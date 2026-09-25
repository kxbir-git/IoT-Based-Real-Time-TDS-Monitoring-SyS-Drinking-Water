import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api/client';
import { FiDroplet, FiMail, FiLock, FiUser, FiEye, FiEyeOff } from 'react-icons/fi';

const DEMO = { email: 'admin@aquasense.io', password: 'admin123' };

export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = mode === 'register'
        ? await authAPI.register({ name: form.name, email: form.email, password: form.password })
        : await authAPI.login({ email: form.email, password: form.password });
      localStorage.setItem('aquasense_token', res.data.access_token);
      localStorage.setItem('aquasense_user', JSON.stringify(res.data.user));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const quickDemo = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await authAPI.login(DEMO);
      localStorage.setItem('aquasense_token', res.data.access_token);
      localStorage.setItem('aquasense_user', JSON.stringify(res.data.user));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Demo login failed. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-main)',
      backgroundImage: `
        radial-gradient(circle at 20% 50%, rgba(45, 98, 255, 0.15), transparent 40%),
        radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.08), transparent 35%),
        radial-gradient(circle at 60% 80%, rgba(45, 98, 255, 0.08), transparent 35%)
      `,
      padding: '1rem',
    }}>
      {/* Decorative blobs */}
      <div style={{
        position: 'fixed', top: '10%', left: '5%',
        width: 400, height: 400,
        background: 'radial-gradient(circle, rgba(45,98,255,0.12) 0%, transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'fixed', bottom: '10%', right: '5%',
        width: 300, height: 300,
        background: 'radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none',
      }} />

      <div style={{
        width: '100%', maxWidth: 440,
        background: 'rgba(26, 29, 45, 0.85)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 28,
        padding: '2.5rem',
        boxShadow: '0 24px 64px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 64, height: 64,
            background: 'linear-gradient(135deg, #2d62ff, #1e40af)',
            borderRadius: 18,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1rem',
            boxShadow: '0 0 30px rgba(45,98,255,0.4)',
          }}>
            <FiDroplet size={32} color="#fff" />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', marginBottom: '0.35rem' }}>
            AquaSense
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            IoT Water Quality Monitoring System
          </p>
        </div>

        {/* Tab Toggle */}
        <div style={{
          display: 'flex',
          background: 'rgba(0,0,0,0.3)',
          borderRadius: 50,
          padding: 4,
          marginBottom: '1.75rem',
        }}>
          {['login', 'register'].map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(''); }}
              style={{
                flex: 1,
                padding: '0.6rem',
                border: 'none',
                borderRadius: 50,
                fontFamily: 'var(--font-ui)',
                fontSize: '0.88rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                background: mode === m ? 'var(--accent-blue)' : 'transparent',
                color: mode === m ? '#fff' : 'var(--text-secondary)',
                boxShadow: mode === m ? '0 0 16px rgba(45,98,255,0.4)' : 'none',
              }}
            >
              {m === 'login' ? 'Sign In' : 'Register'}
            </button>
          ))}
        </div>

        <form onSubmit={submit}>
          {mode === 'register' && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <FiUser size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="Abdul Kabir Khan"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <FiMail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                type="email"
                placeholder="admin@aquasense.io"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <FiLock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                className="form-input"
                style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                type={showPwd ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                {showPwd ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 10,
              padding: '0.65rem 1rem',
              color: '#fca5a5',
              fontSize: '0.85rem',
              marginBottom: '1rem',
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.85rem',
              background: 'linear-gradient(135deg, #2d62ff, #1e40af)',
              border: 'none',
              borderRadius: 14,
              color: '#fff',
              fontSize: '0.95rem',
              fontWeight: 700,
              fontFamily: 'var(--font-ui)',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              boxShadow: '0 0 20px rgba(45,98,255,0.35)',
              transition: 'all 0.2s',
              marginBottom: '1rem',
            }}
          >
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border-light)' }} />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>or</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border-light)' }} />
        </div>

        <button
          onClick={quickDemo}
          disabled={loading}
          style={{
            width: '100%',
            padding: '0.75rem',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid var(--border-light)',
            borderRadius: 14,
            color: 'var(--text-secondary)',
            fontSize: '0.88rem',
            fontWeight: 600,
            fontFamily: 'var(--font-ui)',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.target.style.background = 'rgba(255,255,255,0.08)'; e.target.style.color = '#fff'; }}
          onMouseLeave={e => { e.target.style.background = 'rgba(255,255,255,0.04)'; e.target.style.color = 'var(--text-secondary)'; }}
        >
          🚀 Quick Demo Login
        </button>

        <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '1.5rem' }}>
          Demo: {DEMO.email} / {DEMO.password}
        </p>

        <p style={{ textAlign: 'center', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2rem', lineHeight: 1.6 }}>
          BTECH CSE · Abdul Kabir Khan · Enrollment: 2400100730
        </p>
      </div>
    </div>
  );
}
