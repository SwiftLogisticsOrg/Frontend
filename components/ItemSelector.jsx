'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/lib/apiClient';
import { ChevronDown, ChevronRight, Plus, Minus, ShoppingBag, Store } from 'lucide-react';

export default function ItemSelector({ selectedItems, onItemsChange }) {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedShops, setExpandedShops] = useState(new Set());
  const { token } = useAuth();

  useEffect(() => {
    const fetchShops = async () => {
      try {
        setLoading(true);
        const shopsData = await apiClient.getAllItemsByShop(token);
        setShops(shopsData);
        // Expand first shop by default
        if (shopsData.length > 0) {
          setExpandedShops(new Set([shopsData[0].id]));
        }
      } catch (err) {
        setError('Failed to load shops and items');
        console.error('Error fetching shops:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchShops();
  }, [token]);

  const toggleShop = (shopId) => {
    const newExpanded = new Set(expandedShops);
    if (newExpanded.has(shopId)) {
      newExpanded.delete(shopId);
    } else {
      newExpanded.add(shopId);
    }
    setExpandedShops(newExpanded);
  };

  const getItemQuantity = (itemId) => {
    const item = selectedItems.find(si => si.itemId === itemId);
    return item ? item.quantity : 0;
  };

  const updateItemQuantity = (item, shopId, quantity) => {
    const newItems = [...selectedItems];
    const existingIndex = newItems.findIndex(si => si.itemId === item.id);

    if (quantity === 0) {
      // Remove item if quantity is 0
      if (existingIndex !== -1) {
        newItems.splice(existingIndex, 1);
      }
    } else {
      // Add or update item
      const itemData = {
        itemId: item.id,
        shopId: shopId,
        name: item.name,
        quantity: quantity,
        price: item.price
      };

      if (existingIndex !== -1) {
        newItems[existingIndex] = itemData;
      } else {
        newItems.push(itemData);
      }
    }

    onItemsChange(newItems);
  };

  const increaseQuantity = (item, shopId) => {
    const currentQuantity = getItemQuantity(item.id);
    updateItemQuantity(item, shopId, currentQuantity + 1);
  };

  const decreaseQuantity = (item, shopId) => {
    const currentQuantity = getItemQuantity(item.id);
    if (currentQuantity > 0) {
      updateItemQuantity(item, shopId, currentQuantity - 1);
    }
  };

  const getTotalSelectedItems = () => {
    return selectedItems.reduce((total, item) => total + item.quantity, 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-black">
          Select Items from Shops
        </label>
        {getTotalSelectedItems() > 0 && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <ShoppingBag className="h-4 w-4" />
            <span>{getTotalSelectedItems()} items selected</span>
          </div>
        )}
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden">
        {shops.map((shop) => (
          <div key={shop.id} className="border-b border-gray-200 last:border-b-0">
            <button
              type="button"
              onClick={() => toggleShop(shop.id)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Store className="h-5 w-5 text-gray-500" />
                <div className="text-left">
                  <h3 className="font-medium text-black">{shop.name}</h3>
                  <p className="text-sm text-gray-500">{shop.category} • {shop.address}</p>
                </div>
              </div>
              {expandedShops.has(shop.id) ? (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronRight className="h-5 w-5 text-gray-400" />
              )}
            </button>

            {expandedShops.has(shop.id) && (
              <div className="bg-gray-50 border-t border-gray-200">
                <div className="p-4 space-y-3">
                  {shop.items.map((item) => {
                    const quantity = getItemQuantity(item.id);
                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium text-black">{item.name}</h4>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <span>{item.category}</span>
                            {item.price > 0 && (
                              <>
                                <span>•</span>
                                <span>${item.price}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => decreaseQuantity(item, shop.id)}
                            disabled={quantity === 0}
                            className="p-1 rounded-full border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-8 text-center font-medium">{quantity}</span>
                          <button
                            type="button"
                            onClick={() => increaseQuantity(item, shop.id)}
                            className="p-1 rounded-full border border-gray-300 hover:bg-gray-100 transition-colors"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedItems.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-black mb-2">Selected Items Summary:</h4>
          <div className="space-y-1">
            {selectedItems.map((item) => (
              <div key={item.itemId} className="flex justify-between text-sm">
                <span>{item.name}</span>
                <span className="font-medium">Qty: {item.quantity}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
