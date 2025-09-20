'use client';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import { useRouter } from 'next/navigation';
import { Truck, Package, LogOut, User, ShoppingBag, Bell } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const { user, isAuthenticated, isClient, isDriver, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!isAuthenticated) {
    return (
      <header className="bg-black border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link href="/" className="flex items-center space-x-2">
              <Truck className="h-8 w-8 text-white" />
              <span className="text-2xl font-bold text-white">SwiftTrack</span>
            </Link>
            <div className="flex space-x-4">
              <Link
                href="/login"
                className="text-white hover:text-gray-300 transition-colors"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="bg-white text-black px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-black border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link href={isDriver ? '/driver' : '/orders'} className="flex items-center space-x-2">
            <Truck className="h-8 w-8 text-white" />
            <span className="text-2xl font-bold text-white">SwiftTrack</span>
          </Link>

          <nav className="flex items-center space-x-6">
            {isClient && (
              <>
                <Link
                  href="/select-items"
                  className="text-white hover:text-gray-300 transition-colors flex items-center space-x-1"
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>Shop Items</span>
                </Link>
                <Link
                  href="/orders"
                  className="text-white hover:text-gray-300 transition-colors"
                >
                  Orders
                </Link>
              </>
            )}

            {isDriver && (
              <Link
                href="/driver"
                className="text-white hover:text-gray-300 transition-colors flex items-center space-x-1"
              >
                <Truck className="h-4 w-4" />
                <span>Driver Dashboard</span>
              </Link>
            )}

            <div className="flex items-center space-x-4">
              {/* Notification Bell Icon */}
              <button className="relative text-white hover:text-gray-300 transition-colors p-2">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              
              <div className="flex items-center space-x-2 text-white">
                <User className="h-4 w-4" />
                <span className="text-sm">{user?.name}</span>
                <span className="text-xs bg-white/20 px-2 py-1 rounded capitalize">
                  {user?.role}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="text-white hover:text-gray-300 transition-colors flex items-center space-x-1"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}