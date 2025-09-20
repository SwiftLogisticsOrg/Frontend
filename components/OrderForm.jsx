'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/lib/apiClient';
import { Phone, ShoppingBag, Package, ArrowLeft } from 'lucide-react';
import AddressSelector from './AddressSelector';

export default function OrderForm() {
  const [formData, setFormData] = useState({
    pickupAddress: '',
    deliveryAddress: '',
    selectedItems: [], // Will be loaded from localStorage
    contactPhone: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { user, token } = useAuth();
  const router = useRouter();

  // Load selected items from localStorage on component mount
  useEffect(() => {
    const storedItems = localStorage.getItem('selectedItems');
    if (storedItems) {
      try {
        const parsedItems = JSON.parse(storedItems);
        setFormData(prev => ({
          ...prev,
          selectedItems: parsedItems
        }));
      } catch (err) {
        console.error('Error parsing stored items:', err);
      }
    } else {
      // If no items selected, redirect to item selection page
      router.push('/select-items');
    }
  }, [router]);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const getTotalItems = () => {
    return formData.selectedItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return formData.selectedItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const goBackToItemSelection = () => {
    router.push('/select-items');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.selectedItems.length === 0) {
      setError('Please select at least one item');
      setLoading(false);
      return;
    }

    try {
      // Transform selectedItems to the format expected by the API
      const orderData = {
        ...formData,
        items: formData.selectedItems.map(item => ({
          name: item.name,
          quantity: item.quantity,
          itemId: item.itemId,
          shopId: item.shopId,
          price: item.price
        }))
      };
      
      const order = await apiClient.createOrder(orderData, token);
      
      // Clear selected items from localStorage after successful order creation
      localStorage.removeItem('selectedItems');
      
      router.push(`/orders/${order.id}`);
    } catch (err) {
      setError(err.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-black mb-8">Create New Order</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Pickup Address
            </label>
            <AddressSelector
              name="pickupAddress"
              value={formData.pickupAddress}
              onChange={handleChange}
              placeholder="Enter pickup address"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Delivery Address
            </label>
            <AddressSelector
              name="deliveryAddress"
              value={formData.deliveryAddress}
              onChange={handleChange}
              placeholder="Enter delivery address"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Contact Phone
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="tel"
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="Enter contact phone number"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-black">
                Selected Items
              </label>
              <button
                type="button"
                onClick={goBackToItemSelection}
                className="flex items-center space-x-2 text-black hover:text-gray-700 transition-colors text-sm"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Change Items</span>
              </button>
            </div>

            {formData.selectedItems.length > 0 ? (
              <div className="space-y-3">
                {/* Summary */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <ShoppingBag className="h-5 w-5 text-gray-600" />
                      <span className="font-medium text-black">
                        {getTotalItems()} items selected
                      </span>
                    </div>
                    <div className="text-lg font-bold text-black">
                      LKR {getTotalPrice().toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Items List */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  {formData.selectedItems.map((item, index) => (
                    <div 
                      key={item.itemId} 
                      className={`p-4 flex items-center justify-between ${
                        index !== formData.selectedItems.length - 1 ? 'border-b border-gray-200' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Package className="h-5 w-5 text-gray-500" />
                        <div>
                          <h4 className="font-medium text-black">{item.name}</h4>
                          <p className="text-sm text-gray-500">{item.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-black">Qty: {item.quantity}</div>
                        {item.price > 0 && (
                          <div className="text-sm text-gray-500">
                            LKR {item.price} each
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 border border-gray-200 rounded-lg">
                <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-black mb-2">No items selected</h3>
                <p className="text-gray-500 mb-4">Please select items to deliver</p>
                <button
                  type="button"
                  onClick={goBackToItemSelection}
                  className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Select Items
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => router.push('/orders')}
              className="flex-1 bg-gray-200 text-black py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Creating Order...' : 'Create Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}