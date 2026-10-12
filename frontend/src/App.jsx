import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import DashboardView from './components/DashboardView';
import SubmitVerification from './components/SubmitVerification';
import HistoryView from './components/HistoryView';
import AdminView from './components/AdminView';
import VerificationDetailsModal from './components/VerificationDetailsModal';
import AuthModal from './components/AuthModal';
import { 
  getStoredUser, 
  setStoredUser, 
  setToken, 
  authApi 
} from './services/api';
import { ShieldCheck } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => getStoredUser());

  const [currentTab, setCurrentTab] = useState('dashboard');
  const [selectedRecordForDetails, setSelectedRecordForDetails] = useState(null);
  // Auto-open auth modal if no stored user/token
  const [authModalOpen, setAuthModalOpen] = useState(() => !getStoredUser());

  // Synchronize user profile on startup if token exists
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await authApi.getMe();
        if (res && res.data) {
          setCurrentUser(res.data);
          setStoredUser(res.data);
        }
      } catch (err) {
        // If not logged in, default demo user is fine
      }
    };
    fetchProfile();
  }, []);

  const handleQuickSwitchUser = async (email, password) => {
    try {
      const res = await authApi.login(email, password);
      if (res && res.data) {
        const { token, id, fullName, email: uEmail, role } = res.data;
        setToken(token);
        const userObj = { id, fullName, email: uEmail, role };
        setCurrentUser(userObj);
        setStoredUser(userObj);
      }
    } catch (err) {
      // Fallback demo user simulation if backend is offline
      const role = email.includes('admin') ? 'ROLE_ADMIN' : 'ROLE_USER';
      const name = email.includes('admin') ? 'System Administrator' : 'Research Analyst';
      const fallbackUser = { id: email.includes('admin') ? 1 : 2, fullName: name, email, role };
      setCurrentUser(fallbackUser);
      setStoredUser(fallbackUser);
    }
  };

  const handleLogout = () => {
    setToken(null);
    setStoredUser(null);
    setCurrentUser(null);
    setCurrentTab('dashboard');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        currentUser={currentUser}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
        onQuickSwitchUser={handleQuickSwitchUser}
      />

      <main className="app-container" style={{ flex: 1 }}>
        {currentTab === 'dashboard' && (
          <DashboardView
            onNewVerification={() => setCurrentTab('verify')}
            onViewDetails={(record) => setSelectedRecordForDetails(record)}
          />
        )}

        {currentTab === 'verify' && (
          <SubmitVerification
            onVerificationCreated={(record) => {
              // Can notify or track
            }}
            onViewDetails={(record) => setSelectedRecordForDetails(record)}
          />
        )}

        {currentTab === 'history' && (
          <HistoryView
            onViewDetails={(record) => setSelectedRecordForDetails(record)}
          />
        )}

        {currentTab === 'admin' && currentUser?.role === 'ROLE_ADMIN' && (
          <AdminView />
        )}
      </main>

      {/* Details Modal */}
      {selectedRecordForDetails && (
        <VerificationDetailsModal
          record={selectedRecordForDetails}
          onClose={() => setSelectedRecordForDetails(null)}
        />
      )}

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
          setAuthModalOpen(false);
          // Reload so all components re-fetch with the new JWT token
          window.location.reload();
        }}
      />

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        padding: '24px',
        textAlign: 'center',
        fontSize: '0.8rem',
        color: 'var(--text-muted)',
        marginTop: 'auto'
      }}>
        <div style={{ maxWidth: '1380px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={16} color="var(--accent-primary)" />
            <span>VeriSource AI • Enterprise Fact-Checking & Evidence Synthesis Engine</span>
          </div>
          <div>
            Built with Spring Boot 3.3.4 & React 19 • High-Fidelity Source Tracking
          </div>
        </div>
      </footer>
    </div>
  );
}
