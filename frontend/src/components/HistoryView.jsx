import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Trash2, 
  Eye, 
  Clock, 
  FileText, 
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { verificationApi } from '../services/api';

export default function HistoryView({ onViewDetails }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await verificationApi.listUserVerifications(statusFilter, searchQuery);
      if (res && res.data) {
        setRecords(res.data);
      }
    } catch (err) {
      console.warn('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchRecords();
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete verification record #${id}?`)) {
      return;
    }
    setDeletingId(id);
    try {
      await verificationApi.delete(id);
      setRecords((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      alert('Delete failed: ' + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>
            Verification Archive & Records
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Historical record repository of all analyzed statements, claim breakdowns, and evidence citations.
          </p>
        </div>

        <button
          onClick={fetchRecords}
          className="ghost-btn"
          style={{ padding: '8px 16px' }}
        >
          <RefreshCw size={15} className={loading ? 'spinning' : ''} />
          Refresh
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel" style={{ padding: '16px 20px', marginBottom: '24px' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search across submitted text or keywords..."
              style={{
                width: '100%',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 14px 10px 38px',
                color: '#fff',
                fontSize: '0.88rem',
                outline: 'none'
              }}
            />
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter size={16} color="var(--text-muted)" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                background: 'var(--bg-input)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 14px',
                color: '#fff',
                fontSize: '0.88rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="">All Statuses</option>
              <option value="COMPLETED">Completed</option>
              <option value="PROCESSING">Processing</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>

          <button type="submit" className="gradient-btn" style={{ padding: '10px 18px', fontSize: '0.88rem' }}>
            Filter Records
          </button>
        </form>
      </div>

      {/* Records Table / List */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        {loading && records.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <RefreshCw size={24} className="spinning" style={{ margin: '0 auto 12px', display: 'block' }} />
            Loading verification repository...
          </div>
        ) : records.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <AlertCircle size={24} style={{ margin: '0 auto 12px', display: 'block', color: 'var(--accent-primary)' }} />
            No records matched your search criteria.
          </div>
        ) : (
          <div>
            {records.map((rec, index) => (
              <div
                key={rec.id}
                onClick={() => onViewDetails(rec)}
                style={{
                  padding: '18px 24px',
                  borderBottom: index < records.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '20px',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                  background: 'rgba(255, 255, 255, 0.01)'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.01)'}
              >
                {/* Left Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                      #{rec.id}
                    </span>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(255, 255, 255, 0.06)',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      color: 'var(--text-secondary)'
                    }}>
                      {rec.inputType}
                    </span>
                    <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} />
                      {rec.createdAt ? new Date(rec.createdAt).toLocaleString() : 'Recent'}
                    </span>
                  </div>

                  <div style={{
                    fontSize: '0.92rem',
                    color: '#fff',
                    fontWeight: 500,
                    marginBottom: '8px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {rec.submittedContent}
                  </div>

                  {/* Claims mini counters */}
                  <div style={{ display: 'flex', gap: '10px', fontSize: '0.76rem' }}>
                    <span style={{ color: '#10b981', fontWeight: 600 }}>
                      ✓ {rec.supportedClaims || 0} Supported
                    </span>
                    <span style={{ color: '#f43f5e', fontWeight: 600 }}>
                      ✕ {rec.contradictedClaims || 0} Contradicted
                    </span>
                    <span style={{ color: '#f59e0b', fontWeight: 600 }}>
                      ~ {rec.mixedClaims || 0} Mixed
                    </span>
                    <span style={{ color: '#94a3b8', fontWeight: 600 }}>
                      ? {rec.insufficientClaims || 0} Insufficient
                    </span>
                  </div>
                </div>

                {/* Right Status & Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <span className={`status-badge ${rec.processingStatus?.toLowerCase()}`}>
                    {rec.processingStatus}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewDetails(rec);
                    }}
                    className="ghost-btn"
                    style={{ padding: '8px 12px', fontSize: '0.82rem' }}
                  >
                    <Eye size={14} />
                    Report
                  </button>

                  <button
                    onClick={(e) => handleDelete(rec.id, e)}
                    disabled={deletingId === rec.id}
                    className="ghost-btn"
                    style={{
                      padding: '8px',
                      color: '#ef4444',
                      borderColor: 'rgba(239, 68, 68, 0.2)'
                    }}
                    title="Delete record"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
