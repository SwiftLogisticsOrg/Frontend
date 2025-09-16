import DriverOrderDetailClientPage from './_client_page';
import { apiClient } from '../../../../lib/apiClient';

export async function generateStaticParams() {
  // Get all mock order IDs to enable static export
  const mockData = apiClient.getMockData();
  const orderIds = mockData.orders.map(order => ({ id: order.id }));
  
  return orderIds;
}

export default function DriverOrderDetailPage({ params }) {
  return <DriverOrderDetailClientPage params={params} />;
}