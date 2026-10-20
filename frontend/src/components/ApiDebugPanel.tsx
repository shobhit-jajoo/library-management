import React, { useState } from 'react';
import { useDebug } from '../context/DebugContext';

export const ApiDebugPanel: React.FC = () => {
  const { logs, clearLogs, isOpen, setIsOpen } = useDebug();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedLog = logs.find((l) => l.id === selectedId) || logs[0];

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        right: 0,
        left: 0,
        zIndex: 9999,
        backgroundColor: '#1e1e1e',
        color: '#d4d4d4',
        borderTop: '3px solid #0969da',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.3)',
        fontSize: '0.82rem',
        fontFamily: 'Consolas, Monaco, monospace',
      }}
    >
      {/* Panel Header Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '6px 12px',
          backgroundColor: '#252526',
          cursor: 'pointer',
          userSelect: 'none',
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontWeight: 'bold', color: '#58a6ff' }}>
            🛠️ API Debug Panel ({logs.length} calls)
          </span>
          <span style={{ fontSize: '0.75rem', color: '#8b949e' }}>
            [Security: Credentials Redacted]
          </span>
          {logs.length > 0 && !isOpen && (
            <span
              style={{
                color: logs[0].status >= 400 ? '#f85149' : '#3fb950',
                marginLeft: 10,
              }}
            >
              Latest: {logs[0].method} {logs[0].url.replace(/^.*\/api\/v1/, '/api/v1')} [{logs[0].status}] ({logs[0].durationMs}ms)
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8 }} onClick={(e) => e.stopPropagation()}>
          <button
            onClick={clearLogs}
            style={{
              padding: '2px 8px',
              fontSize: '0.75rem',
              background: '#333',
              color: '#fff',
              border: '1px solid #555',
              borderRadius: 3,
              cursor: 'pointer',
            }}
          >
            Clear
          </button>
          <button
            onClick={() => setIsOpen(!isOpen)}
            style={{
              padding: '2px 8px',
              fontSize: '0.75rem',
              background: '#0969da',
              color: '#fff',
              border: 'none',
              borderRadius: 3,
              cursor: 'pointer',
            }}
          >
            {isOpen ? '▼ Minimize' : '▲ Expand'}
          </button>
        </div>
      </div>

      {/* Expanded Body */}
      {isOpen && (
        <div
          style={{
            height: '320px',
            display: 'flex',
            borderTop: '1px solid #333',
          }}
        >
          {/* Left Column: Request List */}
          <div
            style={{
              width: '38%',
              borderRight: '1px solid #333',
              overflowY: 'auto',
              backgroundColor: '#181818',
            }}
          >
            {logs.length === 0 ? (
              <div style={{ padding: 12, color: '#888' }}>No API calls recorded yet.</div>
            ) : (
              logs.map((log) => {
                const isSelected = selectedLog?.id === log.id;
                const isError = log.status >= 400 || log.status === 0;
                return (
                  <div
                    key={log.id}
                    onClick={() => setSelectedId(log.id)}
                    style={{
                      padding: '6px 10px',
                      cursor: 'pointer',
                      backgroundColor: isSelected ? '#264f78' : 'transparent',
                      borderBottom: '1px solid #222',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.78rem',
                    }}
                  >
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center', overflow: 'hidden' }}>
                      <span
                        style={{
                          fontWeight: 'bold',
                          color:
                            log.method === 'GET'
                              ? '#58a6ff'
                              : log.method === 'POST'
                              ? '#3fb950'
                              : log.method === 'PATCH'
                              ? '#d29922'
                              : '#f85149',
                        }}
                      >
                        {log.method}
                      </span>
                      <span
                        style={{
                          textOverflow: 'ellipsis',
                          overflow: 'hidden',
                          whiteSpace: 'nowrap',
                          maxWidth: 200,
                        }}
                        title={log.url}
                      >
                        {log.url.replace(/^.*\/api\/v1/, '/api/v1')}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <span
                        style={{
                          color: isError ? '#f85149' : '#3fb950',
                          fontWeight: 'bold',
                        }}
                      >
                        {log.status || 'ERR'}
                      </span>
                      <span style={{ color: '#6e7681', fontSize: '0.72rem' }}>
                        {log.durationMs}ms
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: Request & Response Inspector */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: 12,
              backgroundColor: '#1e1e1e',
            }}
          >
            {selectedLog ? (
              <div>
                <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <strong style={{ color: '#fff' }}>{selectedLog.method}</strong>{' '}
                    <span style={{ color: '#58a6ff' }}>{selectedLog.url}</span>
                  </div>
                  <div>
                    Status:{' '}
                    <span
                      style={{
                        color: selectedLog.status >= 400 ? '#f85149' : '#3fb950',
                        fontWeight: 'bold',
                      }}
                    >
                      {selectedLog.status} {selectedLog.statusText}
                    </span>{' '}
                    | Time: {selectedLog.durationMs}ms
                  </div>
                </div>

                {selectedLog.error && (
                  <div
                    style={{
                      padding: 6,
                      backgroundColor: '#3d1214',
                      color: '#f85149',
                      borderRadius: 3,
                      marginBottom: 8,
                    }}
                  >
                    Error: {selectedLog.error}
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {/* Request */}
                  <div>
                    <div style={{ fontWeight: 'bold', color: '#a5d6ff', marginBottom: 4 }}>
                      Request Headers
                    </div>
                    <pre
                      style={{
                        margin: 0,
                        backgroundColor: '#111',
                        padding: 6,
                        borderRadius: 3,
                        maxHeight: 90,
                        overflow: 'auto',
                        fontSize: '0.75rem',
                      }}
                    >
                      {JSON.stringify(selectedLog.requestHeaders, null, 2)}
                    </pre>

                    <div
                      style={{
                        fontWeight: 'bold',
                        color: '#a5d6ff',
                        marginTop: 6,
                        marginBottom: 4,
                      }}
                    >
                      Request Body
                    </div>
                    <pre
                      style={{
                        margin: 0,
                        backgroundColor: '#111',
                        padding: 6,
                        borderRadius: 3,
                        maxHeight: 110,
                        overflow: 'auto',
                        fontSize: '0.75rem',
                      }}
                    >
                      {selectedLog.requestBody
                        ? JSON.stringify(selectedLog.requestBody, null, 2)
                        : '(Empty body)'}
                    </pre>
                  </div>

                  {/* Response */}
                  <div>
                    <div style={{ fontWeight: 'bold', color: '#7ee787', marginBottom: 4 }}>
                      Response Body
                    </div>
                    <pre
                      style={{
                        margin: 0,
                        backgroundColor: '#111',
                        padding: 6,
                        borderRadius: 3,
                        maxHeight: 220,
                        overflow: 'auto',
                        fontSize: '0.75rem',
                      }}
                    >
                      {selectedLog.responseBody
                        ? JSON.stringify(selectedLog.responseBody, null, 2)
                        : '(Empty response)'}
                    </pre>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ color: '#888' }}>Select an API call on the left to inspect.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
