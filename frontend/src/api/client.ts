import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ApiDebugEntry } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Sensitive fields to redact
const SENSITIVE_KEYS = new Set([
  'password',
  'oldPassword',
  'newPassword',
  'token',
  'accessToken',
  'refreshToken',
  'secret',
  'authorization',
]);

export function redactSensitiveData(data: any): any {
  if (!data) return data;
  if (typeof data !== 'object') return data;

  if (Array.isArray(data)) {
    return data.map((item) => redactSensitiveData(item));
  }

  const redacted: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) {
      redacted[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      redacted[key] = redactSensitiveData(value);
    } else {
      redacted[key] = value;
    }
  }
  return redacted;
}

export function redactHeaders(headers: any): Record<string, string> {
  if (!headers) return {};
  const cleaned: Record<string, string> = {};
  const entries = typeof headers.toJSON === 'function' ? headers.toJSON() : headers;

  for (const [key, val] of Object.entries(entries)) {
    const lower = key.toLowerCase();
    if (lower === 'authorization') {
      cleaned[key] = 'Bearer [REDACTED]';
    } else if (SENSITIVE_KEYS.has(lower)) {
      cleaned[key] = '[REDACTED]';
    } else {
      cleaned[key] = String(val);
    }
  }
  return cleaned;
}

// Subscriber listener for debug events
type DebugListener = (entry: ApiDebugEntry) => void;
let debugListener: DebugListener | null = null;

export function setDebugListener(listener: DebugListener | null) {
  debugListener = listener;
}

// Interceptor: Attach Auth Token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('lms_access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Tag request start time
    (config as any)._startTime = Date.now();
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor: Log to Debug panel and handle response
apiClient.interceptors.response.use(
  (response) => {
    const startTime = (response.config as any)._startTime || Date.now();
    const durationMs = Date.now() - startTime;

    if (debugListener) {
      const entry: ApiDebugEntry = {
        id: Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toISOString(),
        method: (response.config.method?.toUpperCase() || 'GET') as any,
        url: (response.config.baseURL || '') + (response.config.url || ''),
        requestHeaders: redactHeaders(response.config.headers),
        requestBody: redactSensitiveData(
          typeof response.config.data === 'string'
            ? safeJsonParse(response.config.data)
            : response.config.data
        ),
        status: response.status,
        statusText: response.statusText || 'OK',
        responseHeaders: redactHeaders(response.headers),
        responseBody: redactSensitiveData(response.data),
        durationMs,
      };
      debugListener(entry);
    }

    return response;
  },
  (error: AxiosError) => {
    const config = error.config;
    const startTime = (config as any)?._startTime || Date.now();
    const durationMs = Date.now() - startTime;

    if (debugListener && config) {
      const entry: ApiDebugEntry = {
        id: Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toISOString(),
        method: (config.method?.toUpperCase() || 'GET') as any,
        url: (config.baseURL || '') + (config.url || ''),
        requestHeaders: redactHeaders(config.headers),
        requestBody: redactSensitiveData(
          typeof config.data === 'string'
            ? safeJsonParse(config.data)
            : config.data
        ),
        status: error.response?.status || 0,
        statusText: error.response?.statusText || 'Network Error',
        responseHeaders: redactHeaders(error.response?.headers),
        responseBody: redactSensitiveData(error.response?.data),
        durationMs,
        error: error.message,
      };
      debugListener(entry);
    }

    return Promise.reject(error);
  }
);

function safeJsonParse(str: string) {
  try {
    return JSON.parse(str);
  } catch {
    return str;
  }
}
