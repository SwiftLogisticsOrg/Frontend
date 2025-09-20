"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Truck, Package, Clock, MapPin } from "lucide-react";

export default function HomePage() {
  const { isAuthenticated, isDriver, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push(isDriver ? "/driver" : "/orders");
    }
  }, [isAuthenticated, isDriver, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <Truck className="h-8 w-8 text-white" />
              <span className="text-2xl font-bold text-white">SwiftTrack</span>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => router.push("/login")}
                className="text-white hover:text-gray-300 transition-colors"
              >
                Login
              </button>
              <button
                onClick={() => router.push("/register")}
                className="bg-white text-black px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="flex justify-center mb-8">
            <Truck className="h-24 w-24 text-white" />
          </div>

          <h1 className="text-6xl font-bold text-white mb-6">
            Swift<span className="text-gray-400">Track</span>
          </h1>

          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            The modern logistics platform that connects clients and drivers for
            seamless delivery experiences. Track your packages in real-time and
            manage deliveries with precision.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <button
              onClick={() => router.push("/register")}
              className="bg-white text-black px-8 py-4 rounded-lg hover:bg-gray-200 transition-colors font-semibold text-lg"
            >
              Start Your Journey
            </button>
            <button
              onClick={() => router.push("/login")}
              className="border border-white text-white px-8 py-4 rounded-lg hover:bg-white/10 transition-colors font-semibold text-lg"
            >
              Sign In
            </button>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="text-center p-6 bg-white/5 rounded-lg">
              <Package className="h-12 w-12 text-white mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Easy Order Management
              </h3>
              <p className="text-gray-400">
                Create, track, and manage your delivery orders with intuitive
                tools designed for efficiency.
              </p>
            </div>

            <div className="text-center p-6 bg-white/5 rounded-lg">
              <Clock className="h-12 w-12 text-white mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Real-Time Updates
              </h3>
              <p className="text-gray-400">
                Stay informed with live status updates and notifications
                throughout the delivery process.
              </p>
            </div>

            <div className="text-center p-6 bg-white/5 rounded-lg">
              <MapPin className="h-12 w-12 text-white mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Smart Route Management
              </h3>
              <p className="text-gray-400">
                Optimize delivery routes and track progress with precision
                location services.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
