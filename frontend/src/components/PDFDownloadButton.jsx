import React from 'react';

const PDFDownloadButton = ({ onGeneratePDF, title, filename, disabled = false }) => {
  return (
    <button
      onClick={onGeneratePDF}
      disabled={disabled}
      style={{
        background: '#4CAF50',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        padding: '12px 20px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        transition: 'all 0.2s ease',
      }}
      onMouseOver={e => {
        if (!disabled) {
          e.target.style.background = '#45a049';
          e.target.style.transform = 'translateY(-1px)';
        }
      }}
      onMouseOut={e => {
        if (!disabled) {
          e.target.style.background = '#4CAF50';
          e.target.style.transform = 'translateY(0)';
        }
      }}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14,2 14,8 20,8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10,9 9,9 8,9" />
      </svg>
      Descargar PDF
    </button>
  );
};

export default PDFDownloadButton;
