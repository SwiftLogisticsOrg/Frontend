'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSocketContext } from '@/components/SocketProvider';
import { apiClient } from '@/lib/apiClient';
import { 
  CheckCircle, 
  Truck, 
  MapPin, 
  Package, 
  Upload, 
  Clock,
  AlertCircle,
  X,
  AlertTriangle
} from 'lucide-react';

const statusFlow = [
  { key: 'assigned', label: 'Assigned', next: 'accepted' },
  { key: 'accepted', label: 'Accepted', next: 'on_way' },
  { key: 'on_way', label: 'On The Way', next: 'arrived_pickup' },
  { key: 'arrived_pickup', label: 'Arrived at Pickup', next: 'picked_up' },
  { key: 'picked_up', label: 'Picked Up', next: 'arrived_delivery' },
  { key: 'arrived_delivery', label: 'Arrived at Delivery', next: 'delivered' },
  { key: 'delivered', label: 'Delivered', next: null }
];

const actionButtons = {
  assigned: { label: 'Accept Order', icon: CheckCircle, color: 'bg-green-600 hover:bg-green-700' },
  accepted: { label: 'Start Trip', icon: Truck, color: 'bg-blue-600 hover:bg-blue-700' },
  on_way: { label: 'Arrived at Pickup', icon: MapPin, color: 'bg-purple-600 hover:bg-purple-700' },
  arrived_pickup: { label: 'Mark as Picked Up', icon: Package, color: 'bg-indigo-600 hover:bg-indigo-700' },
  picked_up: { label: 'Arrived at Delivery', icon: MapPin, color: 'bg-orange-600 hover:bg-orange-700' },
  arrived_delivery: { label: 'Mark as Delivered', icon: CheckCircle, color: 'bg-green-600 hover:bg-green-700' }
};

export default function DriverStatusControls({ order, onStatusUpdate }) {
  const [loading, setLoading] = useState(false);
  const [proofUrl, setProofUrl] = useState('');
  const [showProofUpload, setShowProofUpload] = useState(false);
  const [error, setError] = useState('');

  const { user, token } = useAuth();
  const { socket } = useSocketContext();

  const handleStatusUpdate = async (newStatus) => {
    setLoading(true);
    setError('');

    try {
      if (onStatusUpdate) {
        await onStatusUpdate({ status: newStatus });
      }

      // Show proof upload for delivered status
      if (newStatus === 'delivered') {
        setShowProofUpload(true);
      }

    } catch (err) {
      setError(err.message || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const handleProofUpload = async () => {
    if (!proofUrl.trim()) {
      setError('Please upload a proof file');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await apiClient.uploadProof(user.id, order.id, proofUrl, token);
      setShowProofUpload(false);
      setProofUrl('');
    } catch (err) {
      setError(err.message || 'Failed to upload proof');
    } finally {
      setLoading(false);
    }
  };

  // Find the current action based on order status
  const currentAction = actionButtons[order.status];
  const currentStatusFlow = statusFlow.find(s => s.key === order.status);
  const nextStatus = currentStatusFlow?.next;

  if (!currentAction || !nextStatus) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-lg">
        <div className="text-center py-8">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-black mb-2">
            {order.status === 'delivered' ? 'Order Completed!' : 'Order Status'}
          </h3>
          <p className="text-gray-600">
            {order.status === 'delivered' 
              ? 'This order has been successfully delivered.' 
              : 'No actions available for current status.'
            }
          </p>
          {order.proofUrl && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <p className="text-sm text-green-700 font-medium">Proof of Delivery</p>
              <a 
                href={order.proofUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-green-600 hover:text-green-800 underline text-sm"
              >
                View Proof
              </a>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-black mb-6">Order Actions</h3>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg flex items-center">
          <AlertCircle className="h-4 w-4 mr-2" />
          {error}
        </div>
      )}

      {showProofUpload ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Proof of Delivery
            </label>
            <div className="flex space-x-3">
              <input
                type="url"
                value={proofUrl}
                onChange={(e) => setProofUrl(e.target.value)}
                placeholder="Click to upload"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
              <button
                onClick={handleProofUpload}
                disabled={loading}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Upload className="h-4 w-4" />
                <span>{loading ? 'Uploading...' : 'Upload'}</span>
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Click to upload your proof image or document
            </p>
          </div>
          
          <button
            onClick={() => setShowProofUpload(false)}
            className="text-gray-600 hover:text-gray-800 text-sm underline"
          >
            Skip proof upload
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-black">Current Status</p>
              <p className="text-gray-600 capitalize">{order.status.replace('_', ' ')}</p>
            </div>
            <div className="flex items-center text-gray-500">
              <Clock className="h-4 w-4 mr-1" />
              <span className="text-sm">
                {new Date(order.updatedAt).toLocaleString()}
              </span>
            </div>
          </div>

          {order.status === 'assigned' ? (
            <div className="space-y-2">
              <button
                onClick={() => handleStatusUpdate(nextStatus)}
                disabled={loading}
                className={`w-full ${currentAction.color} text-white py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center space-x-2`}
              >
                <currentAction.icon className="h-5 w-5" />
                <span>
                  {loading ? 'Updating...' : currentAction.label}
                </span>
              </button>

              <button
                onClick={() => handleStatusUpdate('rejected')}
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center space-x-2"
              >
                <X className="h-5 w-5" />
                <span>
                  {loading ? 'Rejecting...' : 'Reject Order'}
                </span>
              </button>
            </div>
          ) : order.status === 'arrived_delivery' ? (
            <div className="space-y-2">
              <button
                onClick={() => handleStatusUpdate(nextStatus)}
                disabled={loading}
                className={`w-full ${currentAction.color} text-white py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center space-x-2`}
              >
                <currentAction.icon className="h-5 w-5" />
                <span>
                  {loading ? 'Updating...' : currentAction.label}
                </span>
              </button>

              <button
                onClick={() => handleStatusUpdate('failed')}
                disabled={loading}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center space-x-2"
              >
                <AlertTriangle className="h-5 w-5" />
                <span>
                  {loading ? 'Marking Failed...' : 'Mark as Failed'}
                </span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => handleStatusUpdate(nextStatus)}
              disabled={loading}
              className={`w-full ${currentAction.color} text-white py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center space-x-2`}
            >
              <currentAction.icon className="h-5 w-5" />
              <span>
                {loading ? 'Updating...' : currentAction.label}
              </span>
            </button>
          )}

          {order.status === 'assigned' && (
            <p className="text-sm text-gray-600 text-center">
              Accept this order to begin the delivery process
            </p>
          )}
        </div>
      )}
    </div>
  );
}