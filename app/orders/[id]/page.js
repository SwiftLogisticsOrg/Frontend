import OrderDetailClientPage from './_client_page';
import { apiClient } from '../../../lib/apiClient';

export async function generateStaticParams() {
  // Return empty array for dynamic routes - no static generation needed
  return [];
}

export default function OrderDetailPage({ params }) {
  return <OrderDetailClientPage params={params} />;
}