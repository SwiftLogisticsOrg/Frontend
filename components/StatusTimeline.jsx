'use client';
import { CheckCircle, Circle, Clock, Truck, MapPin, Package } from 'lucide-react';

const statusSteps = [
  { key: 'created', label: 'Order Created', icon: Package },
  { key: 'assigned', label: 'Driver Assigned', icon: Truck },
  { key: 'accepted', label: 'Order Accepted', icon: CheckCircle },
  { key: 'on_way', label: 'On The Way', icon: Truck },
  { key: 'arrived_pickup', label: 'Arrived at Pickup', icon: MapPin },
  { key: 'picked_up', label: 'Picked Up', icon: Package },
  { key: 'arrived_delivery', label: 'Arrived at Delivery', icon: MapPin },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle }
];

export default function StatusTimeline({ currentStatus, updatedAt }) {
  const currentStepIndex = statusSteps.findIndex(step => step.key === currentStatus);

  return (
    <div className="bg-white rounded-lg p-6 shadow-lg">
      <h3 className="text-lg font-semibold text-black mb-6">Order Status</h3>
      
      <div className="space-y-4">
        {statusSteps.map((step, index) => {
          const isCompleted = index <= currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const Icon = step.icon;

          return (
            <div
              key={step.key}
              className={`flex items-center space-x-4 p-3 rounded-lg transition-all duration-300 ${
                isCurrent ? 'bg-blue-50 border border-blue-200' : ''
              }`}
            >
              <div className={`flex-shrink-0 transition-all duration-300 ${
                isCompleted 
                  ? 'text-green-500' 
                  : isCurrent 
                    ? 'text-blue-500' 
                    : 'text-gray-300'
              }`}>
                {isCompleted ? (
                  <CheckCircle className="h-6 w-6" />
                ) : isCurrent ? (
                  <div className="relative">
                    <Icon className="h-6 w-6" />
                    <div className="absolute -inset-1 bg-blue-500/20 rounded-full animate-pulse" />
                  </div>
                ) : (
                  <Circle className="h-6 w-6" />
                )}
              </div>

              <div className="flex-1">
                <p className={`font-medium transition-colors duration-300 ${
                  isCompleted 
                    ? 'text-green-700' 
                    : isCurrent 
                      ? 'text-blue-700' 
                      : 'text-gray-500'
                }`}>
                  {step.label}
                </p>
                {isCurrent && updatedAt && (
                  <p className="text-sm text-blue-600 flex items-center mt-1">
                    <Clock className="h-3 w-3 mr-1" />
                    Updated {new Date(updatedAt).toLocaleString()}
                  </p>
                )}
              </div>

              {index < statusSteps.length - 1 && (
                <div className={`absolute left-7 mt-10 w-0.5 h-8 transition-colors duration-300 ${
                  isCompleted ? 'bg-green-300' : 'bg-gray-200'
                }`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}