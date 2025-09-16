# SwiftTrack - Logistics Demo Frontend

A modern Next.js frontend for a microservices logistics platform featuring role-based authentication, real-time updates, and elegant black & white design.

## Features

### Core Functionality

- **Role-based Authentication**: JWT-based auth supporting Client and Driver roles
- **Client Features**: Create orders, track deliveries, real-time status updates
- **Driver Features**: View assigned orders, update delivery status, manage route progress
- **Real-time Updates**: Socket.IO integration for live status notifications
- **Responsive Design**: Mobile-first approach with desktop optimization

### Technical Stack

- **Frontend**: Next.js 13+ with React functional components
- **Styling**: Tailwind CSS with custom black & white theme
- **State Management**: React Context (AuthContext)
- **Real-time**: Socket.IO client with mock behavior
- **API Client**: Mock-first approach with easy real API swapping

## Getting Started

### Installation

```bash
npm install
npm run dev
```

### Environment Variables

Create a `.env.local` file (optional for mock mode):

```bash
# For real API integration (currently using mocks)
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=http://localhost:3001
```

### Demo Accounts

The app includes pre-configured demo data:

**Client Account:**

- Email: `alice@example.com` or `charlie@example.com`
- Password: Any password (mock authentication)

**Driver Account:**

- Email: `bob@example.com` or `dave@example.com`
- Password: Any password (mock authentication)

## Usage Guide

### Client Workflow

1. **Login** as a client user
2. **Create Order** with pickup/delivery addresses and items
3. **Track Orders** in real-time via the orders list
4. **View Details** including status timeline and route progress

### Driver Workflow

1. **Login** as a driver user
2. **View Dashboard** with assigned orders
3. **Manage Orders** by progressing through status updates:
   - Accept Order → Start Trip → Arrived at Pickup → Picked Up → Arrived at Delivery → Delivered
4. **Upload Proof** of delivery (optional)

### Real-time Features

- Order status updates reflect immediately across client and driver interfaces
- Socket notifications for new assignments (drivers)
- Animated status timeline with progress indicators

## Architecture

### File Structure

```
/components
  AuthForm.jsx              # Login/register form
  Header.jsx                # Navigation with role-based links
  OrderCard.jsx             # Client order list card
  OrderList.jsx             # Client orders listing
  OrderForm.jsx             # Create order form
  OrderDetail.jsx           # Client order detail view
  StatusTimeline.jsx        # Animated status progression
  DriverOrderCard.jsx       # Driver order card
  DriverStatusControls.jsx  # Driver action buttons
  SocketProvider.jsx        # Socket.IO context provider

/context
  AuthContext.js            # Authentication & role management

/hooks
  useSocket.js              # Socket.IO hook with mock behavior

/lib
  apiClient.js              # Mock-first API client

/app
  /login                    # Authentication pages
  /register
  /orders                   # Client order pages
  /orders/[id]
  /create-order
  /driver                   # Driver pages
  /driver/orders/[id]
```

### API Client Structure

The `apiClient.js` follows a mock-first approach:

- All methods return realistic mock data with simulated latency
- Each method includes commented fetch templates for real API integration
- Easy environment-based switching between mock and real endpoints

## Switching to Real APIs

### 1. Update Environment Variables

```bash
NEXT_PUBLIC_API_BASE_URL=https://your-api-domain.com
NEXT_PUBLIC_WS_URL=wss://your-websocket-domain.com
```

### 2. Uncomment Real API Calls

In `lib/apiClient.js`, uncomment the fetch blocks and comment out mock implementations:

```javascript
// Example: Login method
async login(email, password) {
  // Uncomment this for real API:
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return response.json();

  // Comment out mock implementation:
  // return mockLoginResponse();
}
```

### 3. Update Socket Configuration

In `hooks/useSocket.js`, replace the mock socket with real Socket.IO:

```javascript
const realSocket = io(process.env.NEXT_PUBLIC_WS_URL, {
  auth: { token },
});
```

## API Contract

The frontend expects these endpoints:

### Authentication

- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `GET /users/me` - Current user profile

### Client Orders

- `POST /orders` - Create order
- `GET /orders?clientId={id}` - List client orders
- `GET /orders/{id}` - Order details

### Driver Operations

- `GET /drivers/{id}/orders` - List driver orders
- `POST /drivers/{id}/orders/{orderId}/accept` - Accept assignment
- `POST /drivers/{id}/orders/{orderId}/status` - Update order status
- `POST /drivers/{id}/orders/{orderId}/proof` - Upload proof

### WebSocket Events

- `order.status.updated` - Status change notifications
- `driver.assigned` - New order assignments
- `order.assigned` - Route assignments

## Development Features

### Mock Data Controls

- **Status Simulation**: Dev-only button to advance order status
- **Assignment Simulation**: Driver dashboard includes mock assignment button
- **Socket Event Simulation**: Manual event triggering for testing

### Design System

- **Black & White Theme**: High contrast, elegant design
- **Responsive Breakpoints**: Mobile (<768px), Tablet (768-1024px), Desktop (>1024px)
- **Animation System**: Smooth transitions, loading states, status changes
- **Accessibility**: Semantic HTML, keyboard navigation, focus states

## Deployment

### Build for Production

```bash
npm run build
npm start
```

### Static Export (if needed)

```bash
npm run build && npm run export
```

## Contributing

1. Follow the existing code structure and naming conventions
2. Maintain the mock-first approach for new API integrations
3. Ensure responsive design across all new components
4. Add appropriate loading states and error handling
5. Test both Client and Driver workflows

## License

This is a demo application for showcasing logistics platform capabilities.
