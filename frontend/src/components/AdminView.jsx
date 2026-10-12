import React, { useState, useEffect } from 'react';
import { 
  Users, 
  BarChart3, 
  Database, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  ShieldAlert, 
  ExternalLink,
  Search,
  RefreshCw,
  Lock,
  Unlock
} from 'lucide-react';
import { adminApi } from '../services/api';

export default function AdminView() {
  const [activeSubTab, setActiveSubTab] = useState('users'); // 'users', 'analytics', 'sources', 'logs'
  const [users, setUsers] = useState([]);
  const [systemSummary, setSystemSummary] = useState(null);
  const [sources, setSources] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sourceSearch, setSourceSearch] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeSubTab === 'users') {
        const res = await adminApi.getUsers();
        if (res && res.data) setUsers(res.data);
      } else if (activeSubTab === 'analytics') {
        const res = await adminApi.getSystemSummary();
        if (res && res.data) setSystemSummary(res.data);
      } else if (activeSubTab === 'sources') {
        const res = await adminApi.getAllSources(sourceSearch);
        if (res && res.data) setSources(res.data);
      } else if (activeSubTab === 'logs') {
        const res = await adminApi.getActivityLogs();
        if (res && res.data) setActivityLogs(res.data);
      }
    } catch (err) {
      console.warn('Admin load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeSubTab]);

  const handleToggleUserStatus = async (user) => {
    const nextStatus = user.accountStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      const res = await adminApi.updateUserStatus(user.id, nextStatus, user.role);
      if (res && res.data) {
        setUsers(users.map((u) => (u.id === user.id ? res.data : u)));
      }
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    }
  };

  const handleToggleUserRole = async (user) => {
    const nextRole = user.role === 'ROLE_ADMIN' ? 'ROLE_USER' : 'ROLE_ADMIN';
    try {
      const res = await adminApi.updateUserStatus(user.id, user.accountStatus, nextRole);
      if (res && res.data) {
        setUsers(users.map((u) => (u.id === user.id ? res.data : u)));
      }
    } catch (err) {
      alert('Failed to update role: ' + err.message);
    }
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>
            Administrator Management Portal
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            System-level control over user accounts, curated fact catalogs, and enterprise verification audits.
          </p>
        </div>

        <button onClick={loadData} className="ghost-btn">
          <RefreshCw size={15} className={loading ? 'spinning' : ''} />
          Refresh
        </button>
      </div>

      {/* Sub Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        borderBottom: '1px solid var(--border-subtle)',
        marginBottom: '28px',
        paddingBottom: '8px'
      }}>
        <button
          onClick={() => setActiveSubTab('users')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            background: activeSubTab === 'users' ? 'var(--bg-elevated)' : 'transparent',
            color: activeSubTab === 'users' ? '#fff' : 'var(--text-muted)',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <Users size={16} color={activeSubTab === 'users' ? 'var(--accent-primary)' : 'currentColor'} />
          Users & Permissions
        </button>

        <button
          onClick={() => setActiveSubTab('analytics')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            background: activeSubTab === 'analytics' ? 'var(--bg-elevated)' : 'transparent',
            color: activeSubTab === 'analytics' ? '#fff' : 'var(--text-muted)',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <BarChart3 size={16} color={activeSubTab === 'analytics' ? 'var(--accent-cyan)' : 'currentColor'} />
          System Analytics
        </button>

        <button
          onClick={() => setActiveSubTab('sources')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            background: activeSubTab === 'sources' ? 'var(--bg-elevated)' : 'transparent',
            color: activeSubTab === 'sources' ? '#fff' : 'var(--text-muted)',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <Database size={16} color={activeSubTab === 'sources' ? 'var(--accent-pink)' : 'currentColor'} />
          Indexed Sources
        </button>

        <button
          onClick={() => setActiveSubTab('logs')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            background: activeSubTab === 'logs' ? 'var(--bg-elevated)' : 'transparent',
            color: activeSubTab === 'logs' ? '#fff' : 'var(--text-muted)',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <FileText size={16} color={activeSubTab === 'logs' ? '#eab308' : 'currentColor'} />
          Audit Logs
        </button>
      </div>

      {/* Sub Tab 1: User Management */}
      {activeSubTab === 'users' && (
        <div className="glass-panel" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
              Registered System Accounts ({users.length})
            </h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Manage account deactivations and role privileges
            </span>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ background: 'rgba(0, 0, 0, 0.3)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px 20px', fontWeight: 600 }}>ID</th>
                <th style={{ padding: '12px 20px', fontWeight: 600 }}>User</th>
                <th style={{ padding: '12px 20px', fontWeight: 600 }}>Email</th>
                <th style={{ padding: '12px 20px', fontWeight: 600 }}>Role</th>
                <th style={{ padding: '12px 20px', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '12px 20px', fontWeight: 600 }}>Verifications</th>
                <th style={{ padding: '12px 20px', fontWeight: 600 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '16px 20px', color: 'var(--accent-primary)', fontWeight: 700 }}>
                    #{u.id}
                  </td>
                  <td style={{ padding: '16px 20px', fontWeight: 600, color: '#fff' }}>
                    {u.fullName}
                  </td>
                  <td style={{ padding: '16px 20px', color: 'var(--text-secondary)' }}>
                    {u.email}
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: 'var(--radius-sm)',
                      background: u.role === 'ROLE_ADMIN' ? 'rgba(168, 85, 247, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                      color: u.role === 'ROLE_ADMIN' ? '#c084fc' : '#38bdf8',
                      fontSize: '0.75rem',
                      fontWeight: 600
                    }}>
                      {u.role === 'ROLE_ADMIN' ? 'ADMIN' : 'ANALYST'}
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: u.accountStatus === 'ACTIVE' ? '#10b981' : '#f43f5e'
                    }}>
                      {u.accountStatus === 'ACTIVE' ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                      {u.accountStatus}
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px', color: 'var(--text-secondary)' }}>
                    {u.totalVerifications || 0}
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleToggleUserStatus(u)}
                        className="ghost-btn"
                        style={{ padding: '6px 12px', fontSize: '0.76rem' }}
                        title="Toggle Active / Inactive"
                      >
                        {u.accountStatus === 'ACTIVE' ? <Lock size={12} color="#f43f5e" /> : <Unlock size={12} color="#10b981" />}
                        {u.accountStatus === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                      </button>

                      <button
                        onClick={() => handleToggleUserRole(u)}
                        className="ghost-btn"
                        style={{ padding: '6px 12px', fontSize: '0.76rem' }}
                      >
                        {u.role === 'ROLE_ADMIN' ? 'Demote' : 'Make Admin'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Sub Tab 2: System Analytics */}
      {activeSubTab === 'analytics' && (
        <div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '18px',
            marginBottom: '24px'
          }}>
            <div className="glass-panel" style={{ padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
                {systemSummary?.totalRequests || 0}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '4px' }}>
                Total Enterprise Requests
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#10b981' }}>
                {systemSummary?.supportedPercentage || 0}%
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '4px' }}>
                Overall Supported Ratio
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#f43f5e' }}>
                {systemSummary?.contradictedPercentage || 0}%
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '4px' }}>
                Contradiction Flag Rate
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                {systemSummary?.totalClaimsAnalyzed || 0}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '4px' }}>
                Total Statements Evaluated
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub Tab 3: Sources Catalog */}
      {activeSubTab === 'sources' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
              Fact Reference Sources Catalog ({sources.length})
            </h3>
            <div style={{ width: '320px', position: 'relative' }}>
              <input
                type="text"
                value={sourceSearch}
                onChange={(e) => setSourceSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadData()}
                placeholder="Search source titles or publishers..."
                style={{
                  width: '100%',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-md)',
                  padding: '8px 12px 8px 34px',
                  color: '#fff',
                  fontSize: '0.84rem'
                }}
              />
              <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {sources.map((s) => (
              <div
                key={s.id}
                style={{
                  background: 'rgba(0, 0, 0, 0.25)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start'
                }}
              >
                <div>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: '#38bdf8',
                      fontWeight: 600,
                      fontSize: '0.94rem',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    {s.title}
                    <ExternalLink size={13} />
                  </a>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Publisher: <strong style={{ color: '#fff' }}>{s.publisher || 'External'}</strong> • Date: {s.publicationDate || 'Undated'}
                  </div>
                  {s.sourceMetadata && (
                    <div style={{
                      marginTop: '6px',
                      fontSize: '0.74rem',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--text-secondary)',
                      background: 'rgba(0,0,0,0.3)',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      display: 'inline-block'
                    }}>
                      {s.sourceMetadata}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub Tab 4: Audit Logs */}
      {activeSubTab === 'logs' && (
        <div className="glass-panel" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
              Enterprise Activity Audit Trail
            </h3>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
            <thead>
              <tr style={{ background: 'rgba(0, 0, 0, 0.3)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px 20px', fontWeight: 600 }}>Timestamp</th>
                <th style={{ padding: '12px 20px', fontWeight: 600 }}>Action</th>
                <th style={{ padding: '12px 20px', fontWeight: 600 }}>Entity</th>
                <th style={{ padding: '12px 20px', fontWeight: 600 }}>Analyst User</th>
              </tr>
            </thead>
            <tbody>
              {activityLogs.map((log) => (
                <tr key={log.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '14px 20px', color: 'var(--text-muted)' }}>
                    {log.createdAt ? new Date(log.createdAt).toLocaleString() : 'Recent'}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(99, 102, 241, 0.12)',
                      color: '#a5b4fc',
                      fontWeight: 600,
                      fontSize: '0.76rem'
                    }}>
                      {log.action}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px', color: '#fff' }}>
                    {log.entityType} #{log.entityId}
                  </td>
                  <td style={{ padding: '14px 20px', color: 'var(--text-secondary)' }}>
                    {log.userName} ({log.userEmail})
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
