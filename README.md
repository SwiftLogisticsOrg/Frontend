# SwiftTrack - Logistics Frontend

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
- **Real-time**: Socket.IO client with backend integration
- **API Client**: HTTP-based client for REST API communication

## Getting Started

### Installation

```bash
npm install
npm run dev
```

### Environment Variables

Create a `.env.local` file:

```bash
# API Configuration (required)
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=http://localhost:3001
```

### Setup

Configure your backend API endpoint in the environment variables. The app is designed to work with a compatible logistics backend API.

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
  useSocket.js              # Socket.IO hook for backend communication

/lib
  apiClient.js              # HTTP API client for backend communication

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

The `apiClient.js` provides HTTP communication with the backend:

- RESTful API methods for all operations
- JWT token authentication
- Centralized error handling
- Environment-based API URL configuration

## Backend Integration

### API Configuration

Set your backend API URL in environment variables:

```bash
NEXT_PUBLIC_API_BASE_URL=https://your-api-domain.com
NEXT_PUBLIC_WS_URL=wss://your-websocket-domain.com
```

### Socket.IO Configuration

The frontend connects to the backend Socket.IO server with:

- JWT token authentication
- Auto-reconnection on connection loss
- Event handling for order updates and notifications

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

- `order:status:updated` - Status change notifications
- `order:assigned` - New order assignments to drivers
- `driver:assigned` - Driver assignment notifications
- `connected` - Connection confirmation with user details

## Development Features

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
2. Ensure responsive design across all new components
3. Add appropriate loading states and error handling
4. Validate both Client and Driver workflows
5. Maintain proper error handling for API failures

## License

This is an application for showcasing logistics platform capabilities.
