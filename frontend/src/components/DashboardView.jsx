import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  HelpCircle, 
  TrendingUp, 
  FileText, 
  Globe, 
  Upload, 
  Activity, 
  Clock, 
  ArrowRight,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { dashboardApi, verificationApi } from '../services/api';

export default function DashboardView({ onNewVerification, onViewDetails }) {
  const [summary, setSummary] = useState(null);
  const [activities, setActivities] = useState([]);
  const [recentRecords, setRecentRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sumRes, actRes, recRes] = await Promise.allSettled([
        dashboardApi.getSummary(),
        dashboardApi.getActivity(),
        verificationApi.listUserVerifications(null, '')
      ]);

      if (sumRes.status === 'fulfilled' && sumRes.value.success) {
        setSummary(sumRes.value.data);
      }
      if (actRes.status === 'fulfilled' && actRes.value.success) {
        setActivities(actRes.value.data || []);
      }
      if (recRes.status === 'fulfilled' && recRes.value.success) {
        setRecentRecords(recRes.value.data || []);
      }
    } catch (e) {
      console.warn('Dashboard load error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      {/* Welcome Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(168, 85, 247, 0.08) 100%)',
        border: '1px solid rgba(99, 102, 241, 0.25)',
        borderRadius: 'var(--radius-lg)',
        padding: '28px 32px',
        marginBottom: '32px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#818cf8', fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>
            <ShieldCheck size={16} />
            Analyst Intelligence Hub
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '8px' }}>
            Fact-Checking & Source Tracking Overview
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.94rem', maxWidth: '600px' }}>
            Review active assertions, claim veracity percentages, and evidentiary confidence across all analyzed documents.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={fetchData}
            className="ghost-btn"
            style={{ padding: '10px 14px' }}
            title="Refresh Data"
          >
            <RefreshCw size={16} className={loading ? 'spinning' : ''} />
          </button>
          <button
            onClick={onNewVerification}
            className="gradient-btn"
            style={{ padding: '10px 22px' }}
          >
            New Verification
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '20px',
        marginBottom: '32px'
      }}>
        {/* Total Verifications */}
        <div className="glass-panel" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Total Requests
            </span>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(99, 102, 241, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <TrendingUp size={18} color="var(--accent-primary)" />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fff' }}>
            {summary?.totalRequests || recentRecords.length || 0}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {summary?.totalClaimsAnalyzed || 0} atomic claims analyzed
          </div>
        </div>

        {/* Supported Percentage */}
        <div className="glass-panel" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Supported Statements
            </span>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(16, 185, 129, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <CheckCircle2 size={18} color="#10b981" />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981' }}>
            {summary?.supportedPercentage || 0}%
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {summary?.supportedClaims || 0} statements corroborated
          </div>
        </div>

        {/* Contradicted Percentage */}
        <div className="glass-panel" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Contradicted Claims
            </span>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(244, 63, 94, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <XCircle size={18} color="#f43f5e" />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f43f5e' }}>
            {summary?.contradictedPercentage || 0}%
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {summary?.contradictedClaims || 0} statements refuted
          </div>
        </div>

        {/* Mixed & Insufficient */}
        <div className="glass-panel" style={{ padding: '22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Mixed or Insufficient
            </span>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(245, 158, 11, 0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <AlertTriangle size={18} color="#f59e0b" />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f59e0b' }}>
            {summary ? (summary.mixedPercentage + summary.insufficientPercentage).toFixed(1) : '0'}%
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {(summary?.mixedClaims || 0) + (summary?.insufficientEvidenceClaims || 0)} statements qualified
          </div>
        </div>
      </div>

      {/* Main Grid: Input Types & Recent Records */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '32px' }}>
        {/* Recent Verifications Card */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
              Recent Verification Records
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Latest {recentRecords.slice(0, 5).length} submissions
            </span>
          </div>

          {recentRecords.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
              No verification records submitted yet. Click "New Verification" to analyze your first statement.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {recentRecords.slice(0, 5).map((rec) => (
                <div
                  key={rec.id}
                  onClick={() => onViewDetails(rec)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--accent-primary)'}
                  onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
                >
                  <div style={{ flex: 1, marginRight: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                        #{rec.id}
                      </span>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        • {rec.inputType}
                      </span>
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        • {rec.createdAt ? new Date(rec.createdAt).toLocaleDateString() : 'Today'}
                      </span>
                    </div>
                    <div style={{
                      fontSize: '0.88rem',
                      color: '#fff',
                      fontWeight: 500,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '480px'
                    }}>
                      {rec.submittedContent}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span className={`status-badge ${rec.processingStatus?.toLowerCase()}`}>
                      {rec.processingStatus}
                    </span>
                    <ArrowRight size={16} color="var(--text-muted)" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Input Distribution & Breakdown */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '18px' }}>
            Submission Channels
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              background: 'rgba(0, 0, 0, 0.25)',
              padding: '14px 16px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FileText size={18} color="var(--accent-primary)" />
                <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>Direct Text</span>
              </div>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>
                {summary?.requestsByInputType?.['Text'] || 0}
              </span>
            </div>

            <div style={{
              background: 'rgba(0, 0, 0, 0.25)',
              padding: '14px 16px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Globe size={18} color="var(--accent-cyan)" />
                <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>Web Article URL</span>
              </div>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>
                {summary?.requestsByInputType?.['Article URL'] || 0}
              </span>
            </div>

            <div style={{
              background: 'rgba(0, 0, 0, 0.25)',
              padding: '14px 16px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Upload size={18} color="var(--accent-pink)" />
                <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>Document / OCR</span>
              </div>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>
                {summary?.requestsByInputType?.['File Upload'] || 0}
              </span>
            </div>
          </div>

          <div style={{ marginTop: '24px', paddingTop: '18px', borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              All queries undergo automated fact decomposing, Wikipedia OpenSearch entity retrieval, and relevance scoring.
            </div>
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
          <Activity size={18} color="var(--accent-primary)" />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
            Recent Analyst Activity Audit Trail
          </h3>
        </div>

        {activities.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '0.86rem' }}>
            No recent activity logged for this analyst session.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {activities.map((act) => (
              <div
                key={act.id}
                style={{
                  background: 'rgba(0, 0, 0, 0.2)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <span style={{
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(99, 102, 241, 0.12)',
                    color: '#a5b4fc',
                    marginRight: '8px'
                  }}>
                    {act.action}
                  </span>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    {act.entityType} #{act.entityId}
                  </span>
                </div>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  {act.createdAt ? new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'recent'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
