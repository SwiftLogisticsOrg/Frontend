'use client';
import Link from 'next/link';
import { Clock, Package, ArrowRight } from 'lucide-react';

const statusColors = {
  created: 'bg-blue-100 text-blue-800',
  assigned: 'bg-yellow-100 text-yellow-800',
  accepted: 'bg-orange-100 text-orange-800',
  on_way: 'bg-purple-100 text-purple-800',
  arrived_pickup: 'bg-indigo-100 text-indigo-800',
  picked_up: 'bg-cyan-100 text-cyan-800',
  arrived_delivery: 'bg-green-100 text-green-800',
  delivered: 'bg-green-100 text-green-800'
};

const statusLabels = {
  created: '📋 Created',
  assigned: '👤 Assigned',
  accepted: '✅ Accepted',
  on_way: '🚛 On The Way',
  arrived_pickup: '📍 Arrived at Pickup',
  picked_up: '📦 Picked Up',
  arrived_delivery: '🏠 Arrived at Delivery',
  delivered: '🎉 Delivered'
};

export default function OrderCard({ order }) {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getItemsSummary = (items) => {
    if (items.length === 1) {
      return `${items[0].name} (${items[0].quantity})`;
    }
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    return `${totalItems} items`;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold text-black">Order #{order.id}</h3>
          <div className="flex items-center text-gray-600 text-sm mt-1">
            <Clock className="h-4 w-4 mr-1" />
            <span>Created {formatDate(order.createdAt)}</span>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
          {statusLabels[order.status]}
        </span>
      </div>

      <div className="mb-4">
        <div className="flex items-center text-gray-700 mb-2">
          <Package className="h-4 w-4 mr-2 text-gray-500" />
          <span className="text-sm">{getItemsSummary(order.items)}</span>
        </div>
        <div className="text-sm text-gray-600">
          <div className="flex items-center">
            <span className="font-medium">From:</span>
            <span className="ml-2">{order.pickupAddress}</span>
          </div>
          <div className="flex items-center mt-1">
            <ArrowRight className="h-3 w-3 mr-1 text-gray-400" />
            <span className="font-medium">To:</span>
            <span className="ml-2">{order.deliveryAddress}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Last updated: {formatDate(order.updatedAt)}
        </div>
        <Link
          href={`/orders/${order.id}`}
          className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}