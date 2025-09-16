'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Header';
import OrderDetail from '@/components/OrderDetail';

export default function OrderDetailClientPage({ params }) {
  const { isAuthenticated, isClient, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div>
      <Header />
      <OrderDetail orderId={params.id} />
    </div>
  );
}