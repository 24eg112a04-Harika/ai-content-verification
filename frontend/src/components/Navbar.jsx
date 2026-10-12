import React, { useState } from 'react';
import { 
  ShieldCheck, 
  LayoutDashboard, 
  SearchCode, 
  History, 
  SlidersHorizontal, 
  LogIn, 
  LogOut, 
  User, 
  Sparkles,
  ChevronDown
} from 'lucide-react';

export default function Navbar({ 
  currentTab, 
  setCurrentTab, 
  currentUser, 
  onOpenAuth, 
  onLogout,
  onQuickSwitchUser
}) {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const isAdmin = currentUser?.role === 'ROLE_ADMIN';

  return (
    <header style={{
      borderBottom: '1px solid var(--border-subtle)',
      background: 'rgba(9, 13, 22, 0.85)',
      backdropFilter: 'blur(20px)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      marginBottom: '32px'
    }}>
      <div style={{
        maxWidth: '1380px',
        margin: '0 auto',
        padding: '0 24px',
        height: '70px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px'
      }}>
        {/* Brand Logo */}
        <div 
          onClick={() => setCurrentTab('dashboard')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
            userSelect: 'none'
          }}
        >
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(99, 102, 241, 0.45)'
          }}>
            <ShieldCheck size={24} color="#fff" strokeWidth={2.4} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ 
                fontFamily: 'var(--font-display)', 
                fontWeight: 800, 
                fontSize: '1.25rem',
                letterSpacing: '-0.02em',
                color: '#fff' 
              }}>
                VeriSource
              </span>
              <span style={{
                background: 'linear-gradient(135deg, #6366f1, #ec4899)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 800,
                fontSize: '1.25rem'
              }}>
                AI
              </span>
            </div>
            <div style={{ 
              fontSize: '0.68rem', 
              color: 'var(--text-muted)', 
              fontWeight: 500,
              letterSpacing: '0.04em',
              textTransform: 'uppercase'
            }}>
              Source Tracking & Verification
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(255, 255, 255, 0.03)',
          padding: '4px',
          borderRadius: 'var(--radius-full)',
          border: '1px solid var(--border-subtle)'
        }}>
          <button
            onClick={() => setCurrentTab('dashboard')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              background: currentTab === 'dashboard' ? 'var(--accent-primary)' : 'transparent',
              color: currentTab === 'dashboard' ? '#fff' : 'var(--text-secondary)',
              fontSize: '0.88rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <LayoutDashboard size={16} />
            Dashboard
          </button>

          <button
            onClick={() => setCurrentTab('verify')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              background: currentTab === 'verify' ? 'var(--accent-primary)' : 'transparent',
              color: currentTab === 'verify' ? '#fff' : 'var(--text-secondary)',
              fontSize: '0.88rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <SearchCode size={16} />
            Verify Content
          </button>

          <button
            onClick={() => setCurrentTab('history')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              background: currentTab === 'history' ? 'var(--accent-primary)' : 'transparent',
              color: currentTab === 'history' ? '#fff' : 'var(--text-secondary)',
              fontSize: '0.88rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <History size={16} />
            Records
          </button>

          {isAdmin && (
            <button
              onClick={() => setCurrentTab('admin')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: 'var(--radius-full)',
                border: 'none',
                background: currentTab === 'admin' ? 'linear-gradient(135deg, #8b5cf6, #ec4899)' : 'transparent',
                color: currentTab === 'admin' ? '#fff' : '#c084fc',
                fontSize: '0.88rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <SlidersHorizontal size={16} />
              Admin Portal
            </button>
          )}
        </nav>

        {/* User / Authentication actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative' }}>
          {currentUser ? (
            <div style={{ position: 'relative' }}>
              <div 
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  padding: '6px 14px 6px 10px',
                  borderRadius: 'var(--radius-full)',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: isAdmin ? 'linear-gradient(135deg, #a855f7, #ec4899)' : 'linear-gradient(135deg, #3b82f6, #06b6d4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: '#fff'
                }}>
                  {currentUser.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                  <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#fff' }}>
                    {currentUser.fullName || 'Analyst'}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: isAdmin ? '#c084fc' : 'var(--text-muted)' }}>
                    {isAdmin ? 'System Admin' : 'Analyst'}
                  </div>
                </div>
                <ChevronDown size={14} color="var(--text-muted)" />
              </div>

              {/* Profile Dropdown */}
              {profileDropdownOpen && (
                <div 
                  onClick={() => setProfileDropdownOpen(false)}
                  style={{
                    position: 'absolute',
                    top: '48px',
                    right: 0,
                    width: '260px',
                    background: '#111827',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-lg)',
                    padding: '8px',
                    zIndex: 200
                  }}
                >
                  <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '6px' }}>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Signed in as</div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#fff' }}>{currentUser.email}</div>
                  </div>

                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', padding: '6px 12px 2px', textTransform: 'uppercase' }}>
                    Switch Test Account
                  </div>

                  <button
                    onClick={() => onQuickSwitchUser('analyst@verification.org', 'Analyst@123')}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 12px',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-primary)',
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <User size={14} color="#38bdf8" />
                    Analyst (analyst@verification.org)
                  </button>

                  <button
                    onClick={() => onQuickSwitchUser('admin@verification.org', 'Admin@123')}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 12px',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-primary)',
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <ShieldCheck size={14} color="#c084fc" />
                    Admin (admin@verification.org)
                  </button>

                  <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '6px 0' }} />

                  <button
                    onClick={onLogout}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 12px',
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: 'none',
                      color: '#f87171',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <LogOut size={14} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => onQuickSwitchUser('analyst@verification.org', 'Analyst@123')}
                className="ghost-btn"
                style={{ fontSize: '0.82rem', padding: '6px 12px' }}
                title="Instant Demo Login as Analyst"
              >
                <Sparkles size={14} color="#818cf8" />
                Demo Analyst
              </button>
              <button
                onClick={onOpenAuth}
                className="gradient-btn"
                style={{ fontSize: '0.84rem', padding: '7px 16px' }}
              >
                <LogIn size={14} />
                Sign In
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
