'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useSocketContext } from '@/components/SocketProvider';
import { apiClient } from '@/lib/apiClient';
import Header from '@/components/Header';
import DriverOrderCard from '@/components/DriverOrderCard';
import { Truck, RefreshCw, Bell } from 'lucide-react';

export default function DriverDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState('');

  const { user, token, isAuthenticated, isDriver } = useAuth();
  const { socket } = useSocketContext();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    } else if (!loading && !isDriver) {
      router.push('/orders');
    }
  }, [isAuthenticated, isDriver, loading, router]);

  const fetchOrders = async () => {
    if (!user || !token) return;
    
    try {
      setLoading(true);
      const data = await apiClient.getDriverOrders(user.id, token);
      setOrders(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && token && isDriver) {
      fetchOrders();
    }
  }, [user, token, isDriver]);

  useEffect(() => {
    if (socket) {
      const handleDriverAssigned = (data) => {
        setOrders(prev => [...prev, data]);
        setNotification(`New order assigned: #${data.orderId}`);
        setTimeout(() => setNotification(''), 5000);
      };

      const handleStatusUpdate = (data) => {
        setOrders(prev => prev.map(order => 
          order.id === data.orderId 
            ? { ...order, status: data.status, updatedAt: new Date().toISOString() }
            : order
        ));
      };

      socket.on('driver.assigned', handleDriverAssigned);
      socket.on('order.status.updated', handleStatusUpdate);

      return () => {
        socket.off('driver.assigned', handleDriverAssigned);
        socket.off('order.status.updated', handleStatusUpdate);
      };
    }
  }, [socket]);

  // Dev function to simulate assignment
  const simulateAssignment = () => {
    const mockOrder = {
      id: `ord-${Date.now()}`,
      orderId: `ord-${Date.now()}`,
      pickupAddress: '789 Demo St, Test City',
      deliveryAddress: '321 Sample Ave, Example Town',
      items: [{ name: 'Sample Package', quantity: 1 }],
      status: 'assigned',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      eta: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      contactPhone: '+1234567890'
    };

    if (socket) {
      socket.simulateEvent('driver.assigned', mockOrder);
    }
  };

  if (loading && (!user || !token)) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!isAuthenticated || !isDriver) {
    return null; // Will redirect
  }

  const activeOrders = orders.filter(order => order.status !== 'delivered');
  const completedOrders = orders.filter(order => order.status === 'delivered');

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      {notification && (
        <div className="bg-blue-600 text-white px-6 py-3 flex items-center justify-center space-x-2">
          <Bell className="h-4 w-4" />
          <span>{notification}</span>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Driver Dashboard</h1>
            <p className="text-gray-300 mt-2">Welcome back, {user?.name}</p>
          </div>
          <div className="flex space-x-3">
            {process.env.NODE_ENV === 'development' && (
              <button
                onClick={simulateAssignment}
                className="bg-yellow-500 text-black px-4 py-2 rounded-lg hover:bg-yellow-400 transition-colors text-sm flex items-center space-x-2"
              >
                <Bell className="h-4 w-4" />
                <span>Simulate Assignment (Dev)</span>
              </button>
            )}
            <button
              onClick={fetchOrders}
              className="bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-colors flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Truck className="h-5 w-5 mr-2" />
              Active Orders ({activeOrders.length})
            </h2>
            
            {activeOrders.length === 0 ? (
              <div className="text-center py-12 bg-white/5 rounded-lg">
                <Truck className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No active orders</h3>
                <p className="text-gray-300">You'll be notified when new orders are assigned to you.</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {activeOrders.map(order => (
                  <DriverOrderCard key={order.id} order={order} />
                ))}
              </div>
            )}
          </div>

          {completedOrders.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">
                Completed Orders ({completedOrders.length})
              </h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {completedOrders.map(order => (
                  <DriverOrderCard key={order.id} order={order} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}