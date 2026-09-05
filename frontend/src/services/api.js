const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error?.message || data.message || `Request failed with status ${response.status}`;
    const error = new Error(errorMsg);
    error.code = data.error?.code || data.code;
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // System Health
  getHealth: () => request('/health'),

  // Catalog & Products
  getCatalog: () => request('/catalog'),
  getAICatalog: () => request('/catalog/ai'),
  getProducts: () => request('/products'),
  getProductById: (id) => request(`/products/${id}`),

  // Merchant Policies
  getPolicies: () => request('/policies'),
  updatePolicy: (productId, policy) => request('/policies', { method: 'POST', body: JSON.stringify({ productId, ...policy }) }),

  // Agents
  getAgents: () => request('/agents'),
  registerAgent: (agentData) => request('/agents', { method: 'POST', body: JSON.stringify(agentData) }),

  // Commerce Firewall
  evaluateFirewall: (payload) => request('/firewall/evaluate', { method: 'POST', body: JSON.stringify(payload) }),

  // Bounded Negotiation
  startNegotiation: (data) => request('/negotiations/start', { method: 'POST', body: JSON.stringify(data) }),
  createNegotiation: (data) => request('/negotiations', { method: 'POST', body: JSON.stringify(data) }),
  getSession: (id) => request(`/negotiations/${id}`),
  submitOffer: (sessionId, data) => request(`/negotiations/${sessionId}/offer`, { method: 'POST', body: JSON.stringify(data) }),
  acceptOffer: (sessionId, data) => request(`/negotiations/${sessionId}/accept`, { method: 'POST', body: JSON.stringify(data) }),

  // Payment Gate & Isolation
  createPaymentOrder: (data) => request('/payments/create', { method: 'POST', body: JSON.stringify(data) }),
  verifyPayment: (data) => request('/payments/verify', { method: 'POST', body: JSON.stringify(data) }),

  // Cryptographic Receipts
  getReceipts: () => request('/receipts'),
  getReceiptById: (id) => request(`/receipts/${id}`),
  verifyReceipt: (id, payload = {}) => request(`/receipts/${id}/verify`, { method: 'POST', body: JSON.stringify(payload) }),

  // Audit Trail & Metrics
  getAuditLogs: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/audit-logs${query ? `?${query}` : ''}`);
  },
  getAuditEvents: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/audit-logs${query ? `?${query}` : ''}`);
  },
  getMetrics: () => request('/metrics'),

  // 1-Click Demo Scenarios
  runLegitimateDemo: () => request('/demo/legitimate', { method: 'POST' }),
  runAdversarialDemo: () => request('/demo/adversarial', { method: 'POST' }),
};

export default api;

