'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { apiClient } from '@/lib/apiClient';
import { 
  Store, 
  ShoppingCart, 
  Plus, 
  Minus, 
  ArrowRight, 
  Search,
  Filter,
  Package
} from 'lucide-react';

export default function ItemSelectionPage() {
  const [shops, setShops] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchShops = async () => {
      try {
        setLoading(true);
        const shopsData = await apiClient.getAllItemsByShop(token);
        setShops(shopsData);
      } catch (err) {
        setError('Failed to load shops and items');
        console.error('Error fetching shops:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchShops();
  }, [token]);

  const getUniqueCategories = () => {
    const categories = new Set(['All']);
    shops.forEach(shop => {
      categories.add(shop.category);
    });
    return Array.from(categories);
  };

  const filteredShops = shops.filter(shop => {
    const matchesCategory = selectedCategory === 'All' || shop.category === selectedCategory;
    const matchesSearch = shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shop.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const getItemQuantity = (itemId) => {
    const item = selectedItems.find(si => si.itemId === itemId);
    return item ? item.quantity : 0;
  };

  const updateItemQuantity = (item, shopId, quantity) => {
    const newItems = [...selectedItems];
    const existingIndex = newItems.findIndex(si => si.itemId === item.id);

    if (quantity === 0) {
      if (existingIndex !== -1) {
        newItems.splice(existingIndex, 1);
      }
    } else {
      const itemData = {
        itemId: item.id,
        shopId: shopId,
        name: item.name,
        quantity: quantity,
        price: item.price,
        category: item.category
      };

      if (existingIndex !== -1) {
        newItems[existingIndex] = itemData;
      } else {
        newItems.push(itemData);
      }
    }

    setSelectedItems(newItems);
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

  const getTotalItems = () => {
    return selectedItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return selectedItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const proceedToOrderForm = () => {
    if (selectedItems.length === 0) {
      alert('Please select at least one item before proceeding.');
      return;
    }
    
    // Store selected items in localStorage to pass to order form
    localStorage.setItem('selectedItems', JSON.stringify(selectedItems));
    router.push('/create-order');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-red-100 border border-red-300 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Select Items</h1>
          <p className="text-gray-300">Browse items from different shops and add them to your order</p>
        </div>
        
        {selectedItems.length > 0 && (
          <div className="bg-white rounded-lg p-4 shadow-lg">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <ShoppingCart className="h-5 w-5 text-black" />
                <span className="font-medium text-black">{getTotalItems()} items</span>
              </div>
              <div className="text-lg font-bold text-black">
                LKR {getTotalPrice().toFixed(2)}
              </div>
              <button
                onClick={proceedToOrderForm}
                className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center space-x-2"
              >
                <span>Continue</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg p-6 mb-8 shadow-lg">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search shops or items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent appearance-none bg-white min-w-[150px]"
            >
              {getUniqueCategories().map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Shops Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {filteredShops.map((shop) => (
          <div key={shop.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Shop Header */}
            <div className="bg-gray-50 p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <Store className="h-6 w-6 text-gray-600" />
                <div>
                  <h2 className="text-xl font-bold text-black">{shop.name}</h2>
                  <p className="text-gray-600">{shop.category} • {shop.address}</p>
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="p-6">
              <div className="space-y-4">
                {shop.items.map((item) => {
                  const quantity = getItemQuantity(item.id);
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <Package className="h-4 w-4 text-gray-500" />
                          <h3 className="font-medium text-black">{item.name}</h3>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <span>{item.category}</span>
                          {item.price > 0 && (
                            <>
                              <span>•</span>
                              <span className="font-medium text-green-600">LKR {item.price}</span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => decreaseQuantity(item, shop.id)}
                          disabled={quantity === 0}
                          className="p-2 rounded-full border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center font-medium text-lg">{quantity}</span>
                        <button
                          onClick={() => increaseQuantity(item, shop.id)}
                          className="p-2 rounded-full border border-gray-300 hover:bg-gray-100 transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredShops.length === 0 && (
        <div className="text-center py-12">
          <Store className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-white mb-2">No shops found</h3>
          <p className="text-gray-300">Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* Bottom Cart Summary for Mobile */}
      {selectedItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 lg:hidden">
          <button
            onClick={proceedToOrderForm}
            className="w-full bg-black text-white py-3 rounded-lg font-medium flex items-center justify-center space-x-2"
          >
            <ShoppingCart className="h-5 w-5" />
            <span>{getTotalItems()} items • LKR {getTotalPrice().toFixed(2)}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
