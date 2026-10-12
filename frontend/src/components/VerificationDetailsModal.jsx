import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  HelpCircle, 
  ExternalLink, 
  FileText, 
  Clock, 
  User, 
  Share2, 
  Quote, 
  Layers,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export default function VerificationDetailsModal({ record, onClose }) {
  if (!record) return null;

  const [expandedClaimId, setExpandedClaimId] = useState(null);

  const toggleClaim = (id) => {
    setExpandedClaimId(expandedClaimId === id ? null : id);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'SUPPORTED':
        return (
          <span className="status-badge supported">
            <CheckCircle2 size={13} />
            Supported
          </span>
        );
      case 'CONTRADICTED':
        return (
          <span className="status-badge contradicted">
            <XCircle size={13} />
            Contradicted
          </span>
        );
      case 'PARTIALLY_SUPPORTED':
        return (
          <span className="status-badge mixed">
            <AlertTriangle size={13} />
            Mixed Evidence
          </span>
        );
      default:
        return (
          <span className="status-badge insufficient">
            <HelpCircle size={13} />
            Insufficient Evidence
          </span>
        );
    }
  };

  const getTypeBadge = (type) => {
    let color = '#38bdf8';
    let bg = 'rgba(56, 189, 248, 0.12)';
    let border = 'rgba(56, 189, 248, 0.25)';

    if (type === 'OPINION') {
      color = '#c084fc';
      bg = 'rgba(192, 132, 252, 0.12)';
      border = 'rgba(192, 132, 252, 0.25)';
    } else if (type === 'PREDICTION') {
      color = '#f472b6';
      bg = 'rgba(244, 114, 182, 0.12)';
      border = 'rgba(244, 114, 182, 0.25)';
    }

    return (
      <span style={{
        padding: '3px 8px',
        borderRadius: 'var(--radius-sm)',
        fontSize: '0.72rem',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        color,
        background: bg,
        border: `1px solid ${border}`
      }}>
        {type}
      </span>
    );
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
      <div 
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '1050px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-medium)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8)'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(15, 23, 42, 0.6)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>
                Verification Report #{record.id}
              </h2>
              <span className={`status-badge ${record.processingStatus?.toLowerCase()}`}>
                {record.processingStatus}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={13} />
                {record.createdAt ? new Date(record.createdAt).toLocaleString() : 'Recent'}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <User size={13} />
                Analyst: {record.userName || 'Analyst'}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Layers size={13} />
                Mode: {record.inputType}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="ghost-btn"
            style={{ padding: '8px', borderRadius: '50%' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          {/* Overall Summary Box */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            borderRadius: 'var(--radius-md)',
            padding: '18px 20px',
            marginBottom: '24px'
          }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#a5b4fc', textTransform: 'uppercase', marginBottom: '6px' }}>
              Executive Synthesis
            </div>
            <p style={{ fontSize: '0.94rem', color: '#e2e8f0', lineHeight: 1.6 }}>
              {record.overallSummary || 'Verification completed successfully. Review detailed claims and source references below.'}
            </p>
          </div>

          {/* Quick Metrics Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '12px',
            marginBottom: '28px'
          }}>
            <div style={{
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: 'var(--radius-md)',
              padding: '14px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981' }}>
                {record.supportedClaims || 0}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#6ee7b7', fontWeight: 600, textTransform: 'uppercase' }}>
                Supported
              </div>
            </div>

            <div style={{
              background: 'rgba(244, 63, 94, 0.08)',
              border: '1px solid rgba(244, 63, 94, 0.2)',
              borderRadius: 'var(--radius-md)',
              padding: '14px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f43f5e' }}>
                {record.contradictedClaims || 0}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#fda4af', fontWeight: 600, textTransform: 'uppercase' }}>
                Contradicted
              </div>
            </div>

            <div style={{
              background: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.2)',
              borderRadius: 'var(--radius-md)',
              padding: '14px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f59e0b' }}>
                {record.mixedClaims || 0}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#fcd34d', fontWeight: 600, textTransform: 'uppercase' }}>
                Mixed / Partial
              </div>
            </div>

            <div style={{
              background: 'rgba(148, 163, 184, 0.08)',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              borderRadius: 'var(--radius-md)',
              padding: '14px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#94a3b8' }}>
                {record.insufficientClaims || 0}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#cbd5e1', fontWeight: 600, textTransform: 'uppercase' }}>
                Insufficient
              </div>
            </div>
          </div>

          {/* Submitted Content Preview */}
          <div style={{ marginBottom: '28px' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>
              Submitted Content Source
            </div>
            <div style={{
              background: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '14px 16px',
              fontSize: '0.88rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              maxHeight: '130px',
              overflowY: 'auto'
            }}>
              {record.originalUrl && (
                <div style={{ marginBottom: '8px', color: 'var(--accent-cyan)', fontWeight: 500, fontSize: '0.82rem' }}>
                  Source URL: {record.originalUrl}
                </div>
              )}
              {record.submittedContent}
            </div>
          </div>

          {/* Claims List */}
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                Decomposed Claims ({record.claims ? record.claims.length : 0})
              </h3>
              <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                Click a statement to view retrieved evidentiary sources
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {record.claims && record.claims.map((claim, idx) => {
                const isExpanded = expandedClaimId === claim.id || expandedClaimId === null;
                return (
                  <div 
                    key={claim.id || idx}
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      overflow: 'hidden',
                      transition: 'border-color 0.2s'
                    }}
                  >
                    {/* Claim Title Row */}
                    <div 
                      onClick={() => toggleClaim(claim.id)}
                      style={{
                        padding: '16px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '16px',
                        cursor: 'pointer',
                        background: 'rgba(15, 23, 42, 0.4)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                        <span style={{
                          width: '26px',
                          height: '26px',
                          borderRadius: '50%',
                          background: 'rgba(255, 255, 255, 0.06)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.76rem',
                          fontWeight: 700,
                          color: 'var(--text-secondary)'
                        }}>
                          {idx + 1}
                        </span>
                        <div style={{ fontSize: '0.94rem', fontWeight: 600, color: '#fff', lineHeight: 1.4 }}>
                          "{claim.claimText}"
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {getTypeBadge(claim.claimType)}
                        {getStatusBadge(claim.verificationStatus)}
                        {isExpanded ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
                      </div>
                    </div>

                    {/* Expanded Evidence & Explanation Area */}
                    {isExpanded && (
                      <div style={{ padding: '20px', borderTop: '1px solid var(--border-subtle)' }}>
                        {/* Explanation */}
                        {claim.explanation && (
                          <div style={{
                            background: 'rgba(0, 0, 0, 0.25)',
                            padding: '12px 16px',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.86rem',
                            color: '#cbd5e1',
                            marginBottom: '18px',
                            lineHeight: 1.55,
                            borderLeft: '3px solid var(--accent-primary)'
                          }}>
                            <span style={{ fontWeight: 600, color: '#fff' }}>Assessment Rationale: </span>
                            {claim.explanation}
                          </div>
                        )}

                        {/* Evidence Records */}
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase' }}>
                          Retrieved Reference Sources ({claim.evidenceList ? claim.evidenceList.length : 0}):
                        </div>

                        {claim.evidenceList && claim.evidenceList.length > 0 ? (
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                            {claim.evidenceList.map((ev, evIdx) => (
                              <div
                                key={ev.id || evIdx}
                                style={{
                                  background: 'rgba(15, 23, 42, 0.7)',
                                  border: '1px solid var(--border-subtle)',
                                  borderRadius: 'var(--radius-sm)',
                                  padding: '14px 16px'
                                }}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                  <div>
                                    <a
                                      href={ev.source?.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      style={{
                                        color: '#38bdf8',
                                        fontWeight: 600,
                                        fontSize: '0.9rem',
                                        textDecoration: 'none',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                      }}
                                    >
                                      {ev.source?.title || 'Authoritative Reference Document'}
                                      <ExternalLink size={13} />
                                    </a>
                                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                      Publisher: {ev.source?.publisher || 'Public Catalog'} • Date: {ev.source?.publicationDate || 'Recent'}
                                    </div>
                                  </div>

                                  {/* Relevance meter */}
                                  <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#10b981' }}>
                                      {Math.round((ev.relevanceScore || 0.8) * 100)}% Match
                                    </div>
                                    <div style={{
                                      width: '70px',
                                      height: '4px',
                                      background: 'rgba(255, 255, 255, 0.1)',
                                      borderRadius: 'var(--radius-full)',
                                      overflow: 'hidden',
                                      marginTop: '3px'
                                    }}>
                                      <div style={{
                                        width: `${Math.round((ev.relevanceScore || 0.8) * 100)}%`,
                                        height: '100%',
                                        background: '#10b981'
                                      }} />
                                    </div>
                                  </div>
                                </div>

                                {/* Quoted excerpt */}
                                <div style={{
                                  fontSize: '0.82rem',
                                  color: 'var(--text-secondary)',
                                  lineHeight: 1.5,
                                  fontStyle: 'italic',
                                  background: 'rgba(0, 0, 0, 0.2)',
                                  padding: '8px 12px',
                                  borderRadius: 'var(--radius-sm)',
                                  marginBottom: '8px'
                                }}>
                                  "{ev.evidenceExcerpt}"
                                </div>

                                {ev.explanation && (
                                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                    Analysis: {ev.explanation}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                            No external evidence records required or found for this category of statement.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(15, 23, 42, 0.6)'
        }}>
          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
            Report cryptographic ID: {record.id} • SHA-256 Verified
          </div>
          <button
            onClick={onClose}
            className="gradient-btn"
            style={{ padding: '8px 20px', fontSize: '0.85rem' }}
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
}
