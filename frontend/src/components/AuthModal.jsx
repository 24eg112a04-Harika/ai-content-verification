import React, { useState } from 'react';
import { X, Lock, Mail, User, AlertCircle, ShieldCheck, Sparkles } from 'lucide-react';
import { authApi, setToken, setStoredUser } from '../services/api';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  if (!isOpen) return null;

  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      let res;
      if (mode === 'login') {
        res = await authApi.login(email, password);
      } else {
        res = await authApi.register(fullName, email, password);
      }

      if (res && res.data) {
        const { token, id, fullName: name, email: userEmail, role } = res.data;
        setToken(token);
        const userObj = { id, fullName: name, email: userEmail, role };
        setStoredUser(userObj);
        onAuthSuccess(userObj);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (fillEmail, fillPass) => {
    setMode('login');
    setEmail(fillEmail);
    setPassword(fillPass);
    setError(null);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '440px',
        padding: '28px',
        borderRadius: 'var(--radius-lg)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>
            {mode === 'login' ? 'Sign In to VeriSource' : 'Create Analyst Account'}
          </h2>
          <button onClick={onClose} className="ghost-btn" style={{ padding: '6px', borderRadius: '50%' }}>
            <X size={18} />
          </button>
        </div>

        {/* Quick Demo Accounts Helper */}
        <div style={{
          background: 'rgba(99, 102, 241, 0.08)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          borderRadius: 'var(--radius-md)',
          padding: '12px',
          marginBottom: '20px'
        }}>
          <div style={{ fontSize: '0.74rem', color: '#a5b4fc', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={12} />
            Instant Demo Credentials:
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={() => handleQuickFill('analyst@verification.org', 'Analyst@123')}
              style={{
                flex: 1,
                padding: '6px 8px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                background: 'rgba(0, 0, 0, 0.3)',
                color: '#fff',
                fontSize: '0.74rem',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div style={{ fontWeight: 600 }}>Analyst</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.68rem' }}>Analyst@123</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('admin@verification.org', 'Admin@123')}
              style={{
                flex: 1,
                padding: '6px 8px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                background: 'rgba(0, 0, 0, 0.3)',
                color: '#fff',
                fontSize: '0.74rem',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div style={{ fontWeight: 600, color: '#c084fc' }}>Admin</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.68rem' }}>Admin@123</div>
            </button>
          </div>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 14px',
            color: '#fca5a5',
            fontSize: '0.82rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px'
          }}>
            <AlertCircle size={16} color="#ef4444" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>
                Full Name
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Jane Doe"
                  style={{
                    width: '100%',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-md)',
                    padding: '10px 12px 10px 36px',
                    color: '#fff',
                    fontSize: '0.88rem'
                  }}
                />
                <User size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>
          )}

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="analyst@verification.org"
                style={{
                  width: '100%',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 12px 10px 36px',
                  color: '#fff',
                  fontSize: '0.88rem'
                }}
              />
              <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <div style={{ marginBottom: '22px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 12px 10px 36px',
                  color: '#fff',
                  fontSize: '0.88rem'
                }}
              />
              <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="gradient-btn"
            style={{ width: '100%', padding: '12px', fontSize: '0.92rem', marginBottom: '16px' }}
          >
            {loading ? 'Authenticating...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div style={{ textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          {mode === 'login' ? (
            <>
              Don't have an account yet?{' '}
              <span
                onClick={() => { setMode('register'); setError(null); }}
                style={{ color: 'var(--accent-primary)', fontWeight: 600, cursor: 'pointer' }}
              >
                Sign Up
              </span>
            </>
          ) : (
            <>
              Already registered?{' '}
              <span
                onClick={() => { setMode('login'); setError(null); }}
                style={{ color: 'var(--accent-primary)', fontWeight: 600, cursor: 'pointer' }}
              >
                Sign In
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
