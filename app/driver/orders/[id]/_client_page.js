'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useSocketContext } from '@/components/SocketProvider';
import { apiClient } from '@/lib/apiClient';
import Header from '@/components/Header';
import StatusTimeline from '@/components/StatusTimeline';
import DriverStatusControls from '@/components/DriverStatusControls';
import { ArrowLeft, MapPin, Phone, Package, Clock } from 'lucide-react';

export default function DriverOrderDetailClientPage({ params }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const { user } = useAuth();
  const { socket } = useSocketContext();

  useEffect(() => {
    if (!user || user.role !== 'driver') {
      router.push('/login');
      return;
    }

    fetchOrder();
  }, [params.id, user, router]);

  useEffect(() => {
    if (socket && order) {
      socket.on('orderUpdated', (updatedOrder) => {
        if (updatedOrder.id === order.id) {
          setOrder(updatedOrder);
        }
      });

      return () => {
        socket.off('orderUpdated');
      };
    }
  }, [socket, order]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/orders/${params.id}`);
      setOrder(response.data);
    } catch (err) {
      setError('Failed to load order details');
      console.error('Error fetching order:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      const response = await apiClient.patch(`/orders/${order.id}/status`, {
        status: newStatus,
        driverId: user.id
      });
      setOrder(response.data);
    } catch (err) {
      console.error('Error updating order status:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-md mx-auto pt-20 px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error || 'Order not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-md mx-auto pt-20 px-4 pb-6">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 mb-4"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back
        </button>

        {/* Order Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                Order #{order.orderNumber}
              </h1>
              <p className="text-sm text-gray-500">
                {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              order.status === 'delivered' ? 'bg-green-100 text-green-800' :
              order.status === 'in_transit' ? 'bg-blue-100 text-blue-800' :
              order.status === 'picked_up' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {order.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>

          <div className="flex items-center text-sm text-gray-600 mb-2">
            <Package className="h-4 w-4 mr-2" />
            {order.items?.length || 0} items • ${order.total}
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <Clock className="h-4 w-4 mr-2" />
            Est. delivery: {order.estimatedDelivery}
          </div>
        </div>

        {/* Customer Info */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <h2 className="font-medium text-gray-900 mb-3">Customer</h2>
          <div className="space-y-2">
            <p className="text-sm text-gray-900">{order.customer?.name}</p>
            <div className="flex items-center text-sm text-gray-600">
              <Phone className="h-4 w-4 mr-2" />
              <a href={`tel:${order.customer?.phone}`} className="text-blue-600">
                {order.customer?.phone}
              </a>
            </div>
            <div className="flex items-start text-sm text-gray-600">
              <MapPin className="h-4 w-4 mr-2 mt-0.5" />
              <div>
                <p>{order.deliveryAddress?.street}</p>
                <p>{order.deliveryAddress?.city}, {order.deliveryAddress?.state} {order.deliveryAddress?.zipCode}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Status Timeline */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <h2 className="font-medium text-gray-900 mb-3">Status Timeline</h2>
          <StatusTimeline order={order} />
        </div>

        {/* Driver Controls */}
        <DriverStatusControls 
          order={order}
          onStatusUpdate={handleStatusUpdate}
        />
      </div>
    </div>
  );
}