// API client for SwiftTrack logistics platform
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

// Helper function to handle API responses
const handleResponse = async (response) => {
  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    // try to surface server error message when present
    const message = data && (data.error || data.message) ? (data.error || data.message) : `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  // if server wraps payload in { data: ... } return that, otherwise return parsed body
  if (data && typeof data === 'object' && Object.prototype.hasOwnProperty.call(data, 'data')) {
    return data.data;
  }
  return data;
};

export const apiClient = {
  // Authentication
  async login(email, password) {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    return handleResponse(response);
  },

  async register(name, email, password, role = 'client', phone) {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role, phone })
    });

    return handleResponse(response);
  },

  async getCurrentUser(token) {
    const response = await fetch(`${API_BASE_URL}/api/users/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    return handleResponse(response);
  },

  async getUserById(userId, token) {
    const response = await fetch(`${API_BASE_URL}/api/users/${encodeURIComponent(userId)}`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });

    return handleResponse(response);
  },

  // Client Orders
  async createOrder(orderData, token) {
    const response = await fetch(`${API_BASE_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(orderData)
    });

    return handleResponse(response);
  },

  async getOrders(clientId, token, queryParams = {}) {
    if (clientId) queryParams.clientId = clientId;
    const searchParams = new URLSearchParams(queryParams);
    const response = await fetch(`${API_BASE_URL}/api/orders?${searchParams.toString()}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    return handleResponse(response);
  },

  async getOrderById(orderId, token) {
    const response = await fetch(`${API_BASE_URL}/api/orders/${encodeURIComponent(orderId)}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    return handleResponse(response);
  },

  // Driver endpoints
  async getDriverProfile(driverId, token) {
    // Drivers may have their own profile route; fall back to users route if needed
    const response = await fetch(`${API_BASE_URL}/api/drivers/${encodeURIComponent(driverId)}/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).catch(() => null);

    if (response) return handleResponse(response);

    // fallback: try users/me or users/:id
    const fallback = await fetch(`${API_BASE_URL}/api/users/${encodeURIComponent(driverId)}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return handleResponse(fallback);
  },

  async getDriverOrders(driverId, token) {
    const response = await fetch(`${API_BASE_URL}/api/drivers/${encodeURIComponent(driverId)}/orders`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    return handleResponse(response);
  },

  async acceptOrder(driverId, orderId, token, estimatedArrival) {
    const response = await fetch(`${API_BASE_URL}/api/drivers/${encodeURIComponent(driverId)}/orders/${encodeURIComponent(orderId)}/accept`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ estimatedArrival })
    });

    return handleResponse(response);
  },

  async updateOrderStatus(driverId, orderId, status, metadata = {}, token) {
    const response = await fetch(`${API_BASE_URL}/api/orders/${encodeURIComponent(orderId)}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        status,
        location: metadata.location,
        notes: metadata.notes,
        proofUrl: metadata.proofUrl
      })
    });

    return handleResponse(response);
  },

  async uploadProof(driverId, orderId, proofUrl, token) {
    // Delegate to updateOrderStatus for proof upload
    return this.updateOrderStatus(driverId, orderId, null, { proofUrl }, token);
  },

  // Location updates
  async updateDriverLocation(driverId, location, token) {
    const response = await fetch(`${API_BASE_URL}/api/drivers/${encodeURIComponent(driverId)}/location`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(location)
    });

    return handleResponse(response);
  },

  async getDriverLocation(driverId, token) {
    const response = await fetch(`${API_BASE_URL}/api/drivers/${encodeURIComponent(driverId)}/location`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    return handleResponse(response);
  },

  // Shops and Items
  async getShops(token) {
    const response = await fetch(`${API_BASE_URL}/api/shops`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    return handleResponse(response);
  },

  async getShopItems(shopId, token) {
    const response = await fetch(`${API_BASE_URL}/api/shops/${encodeURIComponent(shopId)}/items`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    return handleResponse(response);
  },

  async getAllItemsByShop(token) {
    const response = await fetch(`${API_BASE_URL}/api/shops/items`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    return handleResponse(response);
  }
};