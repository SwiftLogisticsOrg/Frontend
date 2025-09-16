'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSocketContext } from '@/components/SocketProvider';
import { apiClient } from '@/lib/apiClient';
import OrderCard from './OrderCard';
import { Package, RefreshCw } from 'lucide-react';

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, token } = useAuth();
  const { socket } = useSocketContext();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getOrders(user.id, token);
      setOrders(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user.id, token]);

  useEffect(() => {
    if (socket) {
      const handleStatusUpdate = (data) => {
        setOrders(prev => prev.map(order => 
          order.id === data.orderId 
            ? { ...order, status: data.status, updatedAt: new Date().toISOString() }
            : order
        ));
      };

      socket.on('order.status.updated', handleStatusUpdate);

      return () => {
        socket.off('order.status.updated', handleStatusUpdate);
      };
    }
  }, [socket]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 text-white animate-spin" />
        <span className="ml-3 text-white text-lg">Loading orders...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">No orders yet</h3>
        <p className="text-gray-300 mb-6">Create your first order to get started with SwiftTrack.</p>
        <a
          href="/create-order"
          className="bg-white text-black px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium inline-block"
        >
          Create Order
        </a>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-white">Your Orders</h1>
        <button
          onClick={fetchOrders}
          className="bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-colors flex items-center space-x-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh</span>
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {orders.map(order => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>
    </div>
  );
}