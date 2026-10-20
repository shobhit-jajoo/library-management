import React from 'react';
import { AxiosError } from 'axios';

interface ErrorDisplayProps {
  error: any;
  onClear?: () => void;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, onClear }) => {
  if (!error) return null;

  let message = 'An unknown error occurred';
  let code = '';
  let details: any = null;
  let status: number | undefined = undefined;

  if (typeof error === 'string') {
    message = error;
  } else if (error instanceof AxiosError) {
    status = error.response?.status;
    const data = error.response?.data;
    if (data?.error) {
      code = data.error.code || '';
      message = data.error.message || error.message;
      details = data.error.details;
    } else if (data?.message) {
      message = data.message;
    } else {
      message = error.message;
    }
  } else if (error instanceof Error) {
    message = error.message;
  } else if (error.message) {
    message = error.message;
    code = error.code;
    details = error.details;
  }

  return (
    <div
      style={{
        backgroundColor: '#fff1f0',
        border: '1px solid #ffa39e',
        borderRadius: 4,
        padding: '10px 14px',
        margin: '10px 0',
        color: '#cf1322',
        fontSize: '0.88rem',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <strong>Error {status ? `(${status})` : ''} {code ? `[${code}]` : ''}:</strong> {message}
        </div>
        {onClear && (
          <button
            onClick={onClear}
            style={{
              background: 'none',
              border: 'none',
              color: '#cf1322',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '1rem',
              lineHeight: 1,
            }}
          >
            &times;
          </button>
        )}
      </div>
      {details && (
        <details style={{ marginTop: 6, fontSize: '0.8rem' }}>
          <summary style={{ cursor: 'pointer' }}>View Details / Validation Errors</summary>
          <pre
            style={{
              backgroundColor: '#fff',
              border: '1px solid #ffd8d6',
              padding: 6,
              borderRadius: 3,
              marginTop: 4,
              overflowX: 'auto',
            }}
          >
            {typeof details === 'string' ? details : JSON.stringify(details, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
};
