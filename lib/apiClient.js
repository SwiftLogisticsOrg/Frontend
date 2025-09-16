// Mock-first API client with real fetch templates ready to uncomment
let mockData = {
  users: [
    { id: 'u1', name: 'Alice Johnson', email: 'alice@example.com', role: 'client' },
    { id: 'u2', name: 'Bob Smith', email: 'bob@example.com', role: 'driver' },
    { id: 'u3', name: 'Charlie Brown', email: 'charlie@example.com', role: 'client' },
    { id: 'd1', name: 'Driver Dave', email: 'dave@example.com', role: 'driver' }
  ],
  orders: [
    {
      id: 'ord-001',
      clientId: 'u1',
      driverId: 'd1',
      pickupAddress: '123 Main St, City A',
      deliveryAddress: '456 Oak Ave, City B',
      items: [
        { name: 'Electronics Package', quantity: 1 },
        { name: 'Documents', quantity: 3 }
      ],
      contactPhone: '+1234567890',
      status: 'assigned',
      createdAt: '2025-01-11T10:00:00Z',
      updatedAt: '2025-01-11T10:30:00Z',
      eta: '2025-01-11T14:00:00Z',
      route: [
        { address: '123 Main St, City A', type: 'pickup', completed: false },
        { address: '456 Oak Ave, City B', type: 'delivery', completed: false }
      ]
    }
  ],
  driverOrders: {},
  nextOrderId: 2
};

// Initialize driver orders mapping
mockData.orders.forEach(order => {
  if (order.driverId) {
    if (!mockData.driverOrders[order.driverId]) {
      mockData.driverOrders[order.driverId] = [];
    }
    mockData.driverOrders[order.driverId].push(order.id);
  }
});

const delay = (ms = 300 + Math.random() * 500) => new Promise(resolve => setTimeout(resolve, ms));

export const apiClient = {
  // Authentication
  async login(email, password) {
    await delay();
    
    // TODO: Replace with real API call
    // const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ email, password })
    // });
    // return response.json();

    const user = mockData.users.find(u => u.email === email);
    if (!user) {
      throw new Error('Invalid credentials');
    }
    
    return {
      token: `mock-jwt-${user.id}-${Date.now()}`,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    };
  },

  async register(name, email, password, role = 'client') {
    await delay();
    
    // TODO: Replace with real API call
    // const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/register`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ name, email, password, role })
    // });
    // return response.json();

    const newUser = {
      id: `u${Date.now()}`,
      name,
      email,
      role
    };
    mockData.users.push(newUser);
    
    return newUser;
  },

  async getCurrentUser(token) {
    await delay();
    
    // TODO: Replace with real API call
    // const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/me`, {
    //   headers: { 'Authorization': `Bearer ${token}` }
    // });
    // return response.json();

    const userId = token.split('-')[2];
    return mockData.users.find(u => u.id === userId);
  },

  // Client Orders
  async createOrder(orderData, token) {
    await delay();
    
    // TODO: Replace with real API call
    // const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/orders`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${token}`
    //   },
    //   body: JSON.stringify(orderData)
    // });
    // return response.json();

    const userId = token.split('-')[2];
    const newOrder = {
      id: `ord-${String(mockData.nextOrderId).padStart(3, '0')}`,
      clientId: userId,
      driverId: 'd1', // Auto-assign to first driver for demo
      ...orderData,
      status: 'created',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      eta: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
      route: [
        { address: orderData.pickupAddress, type: 'pickup', completed: false },
        { address: orderData.deliveryAddress, type: 'delivery', completed: false }
      ]
    };
    
    mockData.orders.push(newOrder);
    mockData.nextOrderId++;
    
    // Auto-assign to driver
    if (!mockData.driverOrders[newOrder.driverId]) {
      mockData.driverOrders[newOrder.driverId] = [];
    }
    mockData.driverOrders[newOrder.driverId].push(newOrder.id);
    
    return newOrder;
  },

  async getOrders(clientId, token) {
    await delay();
    
    // TODO: Replace with real API call
    // const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/orders?clientId=${clientId}`, {
    //   headers: { 'Authorization': `Bearer ${token}` }
    // });
    // return response.json();

    return mockData.orders.filter(order => order.clientId === clientId);
  },

  async getOrderById(orderId, token) {
    await delay();
    
    // TODO: Replace with real API call
    // const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/orders/${orderId}`, {
    //   headers: { 'Authorization': `Bearer ${token}` }
    // });
    // return response.json();

    return mockData.orders.find(order => order.id === orderId);
  },

  // Driver endpoints
  async getDriverProfile(driverId, token) {
    await delay();
    
    // TODO: Replace with real API call
    // const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/drivers/${driverId}`, {
    //   headers: { 'Authorization': `Bearer ${token}` }
    // });
    // return response.json();

    const driver = mockData.users.find(u => u.id === driverId && u.role === 'driver');
    return {
      ...driver,
      vehicle: 'Van-01',
      phone: '+1987654321'
    };
  },

  async getDriverOrders(driverId, token) {
    await delay();
    
    // TODO: Replace with real API call
    // const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/drivers/${driverId}/orders`, {
    //   headers: { 'Authorization': `Bearer ${token}` }
    // });
    // return response.json();

    const orderIds = mockData.driverOrders[driverId] || [];
    return mockData.orders.filter(order => orderIds.includes(order.id));
  },

  async acceptOrder(driverId, orderId, token) {
    await delay();
    
    // TODO: Replace with real API call
    // const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/drivers/${driverId}/orders/${orderId}/accept`, {
    //   method: 'POST',
    //   headers: { 'Authorization': `Bearer ${token}` }
    // });
    // return response.json();

    const order = mockData.orders.find(o => o.id === orderId);
    if (order) {
      order.status = 'accepted';
      order.updatedAt = new Date().toISOString();
    }
    
    return { orderId, status: 'accepted' };
  },

  async updateOrderStatus(driverId, orderId, status, metadata = {}, token) {
    await delay();
    
    // TODO: Replace with real API call
    // const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/drivers/${driverId}/orders/${orderId}/status`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${token}`
    //   },
    //   body: JSON.stringify({ status, metadata })
    // });
    // return response.json();

    const order = mockData.orders.find(o => o.id === orderId);
    if (order) {
      order.status = status;
      order.updatedAt = new Date().toISOString();
      
      // Update route completion based on status
      if (status === 'picked_up' && order.route) {
        const pickupStop = order.route.find(r => r.type === 'pickup');
        if (pickupStop) pickupStop.completed = true;
      } else if (status === 'delivered' && order.route) {
        const deliveryStop = order.route.find(r => r.type === 'delivery');
        if (deliveryStop) deliveryStop.completed = true;
      }
      
      if (metadata) {
        order.metadata = { ...order.metadata, ...metadata };
      }
    }
    
    return { orderId, status };
  },

  async uploadProof(driverId, orderId, proofUrl, token) {
    await delay();
    
    // TODO: Replace with real API call
    // const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/drivers/${driverId}/orders/${orderId}/proof`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${token}`
    //   },
    //   body: JSON.stringify({ proofUrl })
    // });
    // return response.json();

    const order = mockData.orders.find(o => o.id === orderId);
    if (order) {
      order.proofUrl = proofUrl;
      order.updatedAt = new Date().toISOString();
    }
    
    return { orderId, proofUrl };
  },

  // Dev/Demo utilities
  simulateStatusUpdate(orderId, status) {
    const order = mockData.orders.find(o => o.id === orderId);
    if (order) {
      order.status = status;
      order.updatedAt = new Date().toISOString();
      console.log(`[Mock] Simulated status update: ${orderId} -> ${status}`);
    }
    return order;
  },

  // Get mock data for dev/debugging
  getMockData() {
    return mockData;
  }
};