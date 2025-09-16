'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSocketContext } from '@/components/SocketProvider';
import { apiClient } from '@/lib/apiClient';
import StatusTimeline from './StatusTimeline';
import { MapPin, Phone, Package, Clock, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function OrderDetail({ orderId }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { token } = useAuth();
  const { socket } = useSocketContext();
  const router = useRouter();

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getOrderById(orderId, token);
      if (!data) {
        setError('Order not found');
        return;
      }
      setOrder(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch order');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId, token]);

  useEffect(() => {
    if (socket) {
      const handleStatusUpdate = (data) => {
        if (data.orderId === orderId) {
          setOrder(prev => prev ? {
            ...prev,
            status: data.status,
            updatedAt: new Date().toISOString()
          } : prev);
        }
      };

      socket.on('order.status.updated', handleStatusUpdate);

      return () => {
        socket.off('order.status.updated', handleStatusUpdate);
      };
    }
  }, [socket, orderId]);

  // Dev-only function to simulate status updates
  const simulateStatusUpdate = () => {
    if (!order) return;
    
    const statuses = ['created', 'assigned', 'accepted', 'on_way', 'arrived_pickup', 'picked_up', 'arrived_delivery', 'delivered'];
    const currentIndex = statuses.indexOf(order.status);
    const nextStatus = statuses[currentIndex + 1];
    
    if (nextStatus && socket) {
      const updatedOrder = apiClient.simulateStatusUpdate(orderId, nextStatus);
      socket.simulateEvent('order.status.updated', {
        orderId,
        status: nextStatus,
        metadata: {}
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        <span className="ml-3 text-white text-lg">Loading order...</span>
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

  if (!order) {
    return (
      <div className="text-center py-12">
        <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Order not found</h3>
        <button
          onClick={() => router.push('/orders')}
          className="bg-white text-black px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => router.push('/orders')}
          className="flex items-center text-white hover:text-gray-300 transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </button>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">Order #{order.id}</h1>
          {process.env.NODE_ENV === 'development' && (
            <button
              onClick={simulateStatusUpdate}
              className="bg-yellow-500 text-black px-4 py-2 rounded-lg hover:bg-yellow-400 transition-colors text-sm"
            >
              Simulate Next Status (Dev)
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-black mb-4">Order Details</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Pickup Address
                </label>
                <div className="flex items-start space-x-2">
                  <MapPin className="h-5 w-5 text-green-500 mt-0.5" />
                  <span className="text-gray-900">{order.pickupAddress}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Delivery Address
                </label>
                <div className="flex items-start space-x-2">
                  <MapPin className="h-5 w-5 text-red-500 mt-0.5" />
                  <span className="text-gray-900">{order.deliveryAddress}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  Contact Phone
                </label>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-900">{order.contactPhone}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">
                  Items
                </label>
                <div className="space-y-2">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Package className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-900">{item.name}</span>
                      </div>
                      <span className="text-gray-600 font-medium">Qty: {item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Clock className="h-4 w-4" />
                  <span>Created {new Date(order.createdAt).toLocaleString()}</span>
                </div>
                {order.eta && (
                  <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                    <Clock className="h-4 w-4" />
                    <span>ETA {new Date(order.eta).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {order.route && order.route.length > 0 && (
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-black mb-4">Route</h3>
              <div className="space-y-3">
                {order.route.map((stop, index) => (
                  <div
                    key={index}
                    className={`flex items-center space-x-3 p-3 rounded-lg ${
                      stop.completed ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                    }`}
                  >
                    <div className={`flex-shrink-0 ${
                      stop.completed ? 'text-green-500' : 'text-gray-400'
                    }`}>
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${
                        stop.completed ? 'text-green-700' : 'text-gray-700'
                      }`}>
                        {stop.type === 'pickup' ? 'Pickup' : 'Delivery'}
                      </p>
                      <p className="text-sm text-gray-600">{stop.address}</p>
                    </div>
                    {stop.completed && (
                      <div className="text-green-500">
                        <CheckCircle className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <StatusTimeline currentStatus={order.status} updatedAt={order.updatedAt} />
        </div>
      </div>
    </div>
  );
}