import React, { useState } from 'react';
import { 
  FileText, 
  Globe, 
  Upload, 
  Sparkles, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  FileCheck2,
  ArrowRight
} from 'lucide-react';
import { verificationApi } from '../services/api';

const SAMPLES = [
  {
    title: 'Chandrayaan-3 (Factual)',
    text: "India launched Chandrayaan-3 in 2023. The mission successfully landed near the Moon's south polar region.",
    tag: 'Demonstrated in Demo'
  },
  {
    title: 'Climate Assessment (Scientific)',
    text: "Global surface temperatures in 2023 reached record highs. Human activities and greenhouse gas emissions are the primary driver of modern climate shifts.",
    tag: 'IPCC & NASA'
  },
  {
    title: 'Subjective Opinion & Prediction',
    text: "The spacecraft is arguably the most beautiful vessel ever built. Scientists predict quantum processors will dominate all computing by 2045.",
    tag: 'Opinion Markers'
  }
];

export default function SubmitVerification({ onVerificationCreated, onViewDetails }) {
  const [activeMode, setActiveMode] = useState('text'); // 'text', 'url', 'file'
  
  // Inputs
  const [textContent, setTextContent] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);

  // States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeProgress, setActiveProgress] = useState(null); // { recordId, status, progress, message }

  const handlePreFill = (sampleText) => {
    setTextContent(sampleText);
    setError(null);
  };

  const pollStatus = async (recordId) => {
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      try {
        const res = await verificationApi.getStatus(recordId);
        if (res.success && res.data) {
          const { processingStatus, progressPercentage, message } = res.data;
          setActiveProgress({
            recordId,
            status: processingStatus,
            progress: progressPercentage,
            message
          });

          if (processingStatus === 'COMPLETED' || processingStatus === 'FAILED' || attempts > 25) {
            clearInterval(interval);
            setLoading(false);
            if (processingStatus === 'COMPLETED') {
              const fullRecord = await verificationApi.getById(recordId);
              if (fullRecord.success && fullRecord.data) {
                if (onVerificationCreated) onVerificationCreated(fullRecord.data);
                if (onViewDetails) onViewDetails(fullRecord.data);
              }
            }
          }
        }
      } catch (err) {
        clearInterval(interval);
        setLoading(false);
        setError('Verification polling error: ' + err.message);
      }
    }, 1200);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setActiveProgress({
      status: 'PENDING',
      progress: 15,
      message: 'Initializing claim extraction engine...'
    });

    try {
      let res;
      if (activeMode === 'text') {
        if (!textContent.trim()) {
          throw new Error('Please enter text to verify.');
        }
        res = await verificationApi.submitText(textContent.trim());
      } else if (activeMode === 'url') {
        if (!urlInput.trim()) {
          throw new Error('Please enter a valid URL.');
        }
        res = await verificationApi.submitUrl(urlInput.trim());
      } else if (activeMode === 'file') {
        if (!uploadedFile) {
          throw new Error('Please select a file to upload.');
        }
        res = await verificationApi.submitFile(uploadedFile);
      }

      if (res && res.data && res.data.id) {
        pollStatus(res.data.id);
      } else {
        setLoading(false);
      }
    } catch (err) {
      setLoading(false);
      setActiveProgress(null);
      setError(err.message || 'Failed to submit verification.');
    }
  };

  return (
    <div style={{ maxWidth: '980px', margin: '0 auto' }}>
      {/* Hero Title */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          borderRadius: 'var(--radius-full)',
          background: 'rgba(99, 102, 241, 0.1)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          color: '#a5b4fc',
          fontSize: '0.8rem',
          fontWeight: 600,
          marginBottom: '14px'
        }}>
          <Sparkles size={14} />
          Automated Claim Extraction & Multi-Source Evidence Corroboration
        </div>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: '10px' }}>
          Verify Statements & <span className="gradient-text">Track Sources</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '640px', margin: '0 auto' }}>
          Submit text, article links, or documents. Our system decomposes your input into atomic claims, queries reference databases, and scores evidentiary support.
        </p>
      </div>

      {/* Main Verification Card */}
      <div className="glass-panel" style={{ padding: '28px', marginBottom: '24px' }}>
        {/* Mode Selector Tabs */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '8px',
          background: 'rgba(0, 0, 0, 0.25)',
          padding: '5px',
          borderRadius: 'var(--radius-md)',
          marginBottom: '24px'
        }}>
          <button
            type="button"
            onClick={() => setActiveMode('text')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: activeMode === 'text' ? 'var(--bg-elevated)' : 'transparent',
              color: activeMode === 'text' ? '#fff' : 'var(--text-muted)',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: activeMode === 'text' ? 'var(--shadow-sm)' : 'none'
            }}
          >
            <FileText size={18} color={activeMode === 'text' ? 'var(--accent-primary)' : 'currentColor'} />
            Plain Text
          </button>

          <button
            type="button"
            onClick={() => setActiveMode('url')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: activeMode === 'url' ? 'var(--bg-elevated)' : 'transparent',
              color: activeMode === 'url' ? '#fff' : 'var(--text-muted)',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: activeMode === 'url' ? 'var(--shadow-sm)' : 'none'
            }}
          >
            <Globe size={18} color={activeMode === 'url' ? 'var(--accent-cyan)' : 'currentColor'} />
            Article URL
          </button>

          <button
            type="button"
            onClick={() => setActiveMode('file')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: activeMode === 'file' ? 'var(--bg-elevated)' : 'transparent',
              color: activeMode === 'file' ? '#fff' : 'var(--text-muted)',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: activeMode === 'file' ? 'var(--shadow-sm)' : 'none'
            }}
          >
            <Upload size={18} color={activeMode === 'file' ? 'var(--accent-pink)' : 'currentColor'} />
            Document / Image
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit}>
          {activeMode === 'text' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Input Statements or Passages:
                </label>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {textContent.length} characters
                </span>
              </div>

              <textarea
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                placeholder="Paste news articles, speeches, or statements to be analyzed (e.g. 'India launched Chandrayaan-3 in 2023. The mission landed near the south pole.')..."
                rows={6}
                style={{
                  width: '100%',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px',
                  color: '#fff',
                  fontSize: '0.92rem',
                  lineHeight: '1.6',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  outline: 'none',
                  marginBottom: '16px'
                }}
              />

              {/* Sample Pre-fills */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600 }}>
                  QUICK EXAMPLES:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {SAMPLES.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handlePreFill(s.text)}
                      style={{
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-full)',
                        padding: '6px 12px',
                        color: 'var(--text-secondary)',
                        fontSize: '0.76rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--accent-primary)'}
                      onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
                    >
                      <Sparkles size={12} color="var(--accent-primary)" />
                      <span>{s.title}</span>
                      <span style={{ opacity: 0.5 }}>• {s.tag}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeMode === 'url' && (
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Article or Webpage URL:
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://example.com/news/article-headline"
                  style={{
                    width: '100%',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px 14px 14px 44px',
                    color: '#fff',
                    fontSize: '0.94rem',
                    outline: 'none'
                  }}
                />
                <Globe size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <HelpCircle size={13} />
                Content is retrieved using our SSRF-hardened parser (restricted to standard public domains).
              </div>
            </div>
          )}

          {activeMode === 'file' && (
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Upload Document or Image:
              </label>
              <div style={{
                border: '2px dashed var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                padding: '36px 20px',
                textAlign: 'center',
                background: 'rgba(0, 0, 0, 0.2)',
                cursor: 'pointer',
                position: 'relative'
              }}>
                <input
                  type="file"
                  onChange={(e) => setUploadedFile(e.target.files[0])}
                  accept=".pdf,.txt,.md,.csv,.json,.png,.jpg,.jpeg"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    opacity: 0,
                    cursor: 'pointer'
                  }}
                />
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'rgba(236, 72, 153, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px'
                }}>
                  <Upload size={24} color="#ec4899" />
                </div>
                <div style={{ fontWeight: 600, color: '#fff', marginBottom: '4px' }}>
                  {uploadedFile ? uploadedFile.name : 'Click to select or drag and drop files'}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Supports PDF (with text stripping), TXT, Markdown, and Images (PNG, JPG with OCR pipeline) up to 25MB
                </div>
              </div>
            </div>
          )}

          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 16px',
              color: '#fca5a5',
              fontSize: '0.86rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '20px'
            }}>
              <AlertCircle size={18} color="#ef4444" />
              <span>{error}</span>
            </div>
          )}

          {/* Processing Progress Bar */}
          {activeProgress && (
            <div style={{
              background: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-md)',
              padding: '18px',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Loader2 size={16} className="spinning" color="var(--accent-primary)" />
                  <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#fff' }}>
                    {activeProgress.message}
                  </span>
                </div>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                  {activeProgress.progress}%
                </span>
              </div>

              {/* Progress Track */}
              <div style={{
                height: '8px',
                background: 'rgba(255, 255, 255, 0.08)',
                borderRadius: 'var(--radius-full)',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  width: `${activeProgress.progress}%`,
                  background: 'linear-gradient(90deg, #6366f1, #06b6d4)',
                  transition: 'width 0.4s ease'
                }} />
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              type="submit"
              disabled={loading}
              className="gradient-btn"
              style={{ padding: '12px 28px', fontSize: '0.94rem' }}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="spinning" />
                  Analyzing Statements...
                </>
              ) : (
                <>
                  <FileCheck2 size={18} />
                  Run Full Verification
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
