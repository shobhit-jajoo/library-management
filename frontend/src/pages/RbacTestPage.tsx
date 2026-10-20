import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { ErrorDisplay } from '../components/ErrorDisplay';
import { redactSensitiveData } from '../api/client';

export const RbacTestPage: React.FC = () => {
  const { token } = useAuth();
  // Supported backend methods only (NO PUT)
  const [method, setMethod] = useState<'GET' | 'POST' | 'PATCH' | 'DELETE'>('GET');
  const [url, setUrl] = useState('/api/v1/admin/policy');
  const [customToken, setCustomToken] = useState('');
  const [tokenMode, setTokenMode] = useState<'admin' | 'none' | 'custom'>('admin');
  const [requestBody, setRequestBody] = useState('{\n  "borrowLimit": 5\n}');
  const [loading, setLoading] = useState(false);
  const [responseResult, setResponseResult] = useState<any>(null);
  const [error, setError] = useState<any>(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponseResult(null);

    let activeAuthHeader: string | undefined = undefined;
    if (tokenMode === 'admin' && token) {
      activeAuthHeader = `Bearer ${token}`;
    } else if (tokenMode === 'custom' && customToken) {
      activeAuthHeader = `Bearer ${customToken}`;
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (activeAuthHeader) {
      headers['Authorization'] = activeAuthHeader;
    }

    let parsedBody: any = undefined;
    if ((method === 'POST' || method === 'PATCH') && requestBody.trim()) {
      try {
        parsedBody = JSON.parse(requestBody);
      } catch (err: any) {
        setError(new Error(`Invalid JSON request body: ${err.message}`));
        setLoading(false);
        return;
      }
    }

    const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;

    try {
      const res = await axios({
        method,
        url: fullUrl,
        headers,
        data: parsedBody,
        validateStatus: () => true, // Don't throw for 4xx/5xx to capture RBAC status codes directly
      });

      setResponseResult({
        status: res.status,
        statusText: res.statusText,
        headers: res.headers,
        data: redactSensitiveData(res.data),
      });
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const setPreset = (m: 'GET' | 'POST' | 'PATCH' | 'DELETE', u: string, body?: string) => {
    setMethod(m);
    setUrl(u);
    if (body) setRequestBody(body);
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>RBAC & Security Testing Sandbox</h2>
        <p style={{ margin: '4px 0 0 0', color: '#57606a', fontSize: '0.88rem' }}>
          Test endpoints against different roles and anonymous tokens to verify 401 Unauthorized and 403 Forbidden enforcement. (Supports only GET, POST, PATCH, DELETE).
        </p>
      </div>

      <ErrorDisplay error={error} onClear={() => setError(null)} />

      {/* Quick Test Presets */}
      <div className="card" style={{ marginBottom: 16, backgroundColor: '#f6f8fa' }}>
        <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 8 }}>
          Quick RBAC Scenarios:
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setTokenMode('none');
              setPreset('GET', '/api/v1/admin/policy');
            }}
          >
            No Token &rarr; Admin Policy (Expect 401)
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setTokenMode('none');
              setPreset('GET', '/api/v1/audit');
            }}
          >
            No Token &rarr; Audit Logs (Expect 401)
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setTokenMode('admin');
              setPreset('GET', '/api/v1/admin/users');
            }}
          >
            Admin Token &rarr; Users List (Expect 200)
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setTokenMode('admin');
              setPreset('PATCH', '/api/v1/admin/policy', '{\n  "borrowLimit": 7\n}');
            }}
          >
            Admin Token &rarr; Update Policy (Expect 200)
          </button>
        </div>
      </div>

      {/* Request Builder Form */}
      <div className="card" style={{ marginBottom: 16 }}>
        <form onSubmit={handleSendRequest}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <select
              className="form-control"
              style={{ width: 110, fontWeight: 600 }}
              value={method}
              onChange={(e) => setMethod(e.target.value as any)}
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PATCH">PATCH</option>
              <option value="DELETE">DELETE</option>
            </select>
            <input
              type="text"
              className="form-control"
              style={{ flex: 1 }}
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="/api/v1/admin/policy"
            />
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Sending...' : 'Send Request'}
            </button>
          </div>

          {/* Auth Token Selector */}
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 12, fontSize: '0.85rem' }}>
            <span style={{ fontWeight: 600 }}>Authorization:</span>
            <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <input
                type="radio"
                name="tokenMode"
                value="admin"
                checked={tokenMode === 'admin'}
                onChange={() => setTokenMode('admin')}
              />
              Active Admin Token
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <input
                type="radio"
                name="tokenMode"
                value="none"
                checked={tokenMode === 'none'}
                onChange={() => setTokenMode('none')}
              />
              No Authorization (Anonymous)
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <input
                type="radio"
                name="tokenMode"
                value="custom"
                checked={tokenMode === 'custom'}
                onChange={() => setTokenMode('custom')}
              />
              Custom Token (e.g. Patron/Librarian token)
            </label>
          </div>

          {tokenMode === 'custom' && (
            <div style={{ marginBottom: 12 }}>
              <input
                type="text"
                className="form-control"
                placeholder="Paste Bearer token here to simulate Patron / Librarian request..."
                value={customToken}
                onChange={(e) => setCustomToken(e.target.value)}
              />
            </div>
          )}

          {/* JSON Body (for POST/PATCH) */}
          {(method === 'POST' || method === 'PATCH') && (
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 4 }}>
                Request JSON Body:
              </label>
              <textarea
                className="form-control"
                rows={4}
                style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}
                value={requestBody}
                onChange={(e) => setRequestBody(e.target.value)}
              />
            </div>
          )}
        </form>
      </div>

      {/* Response Display */}
      {responseResult && (
        <div className="card" style={{ backgroundColor: '#1e1e1e', color: '#d4d4d4' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div>
              <span style={{ fontWeight: 600, color: '#58a6ff' }}>Response Status:</span>{' '}
              <span
                style={{
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  color:
                    responseResult.status < 300
                      ? '#3fb950'
                      : responseResult.status === 401 || responseResult.status === 403
                      ? '#f85149'
                      : '#d29922',
                }}
              >
                {responseResult.status} {responseResult.statusText}
              </span>
            </div>
          </div>
          <div style={{ fontWeight: 600, color: '#8b949e', fontSize: '0.8rem', marginBottom: 4 }}>
            Response Body:
          </div>
          <pre style={{ margin: 0, maxHeight: 350, overflow: 'auto', fontSize: '0.8rem' }}>
            {JSON.stringify(responseResult.data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
