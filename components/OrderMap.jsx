'use client';
import { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons for pickup and delivery
const pickupIcon = new L.Icon({
    iconUrl: 'https://cdn.jsdelivr.net/gh/pointhi/leaflet-color-markers@master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const deliveryIcon = new L.Icon({
    iconUrl: 'https://cdn.jsdelivr.net/gh/pointhi/leaflet-color-markers@master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

export default function OrderMap({ order }) {
    const [mounted, setMounted] = useState(false);
    const [routeCoordinates, setRouteCoordinates] = useState([]);
    const [isLoadingRoute, setIsLoadingRoute] = useState(false);

    console.log('Order data in OrderMap:', order);

    // Extract coordinates from order data using useMemo to prevent re-renders
    const pickupCoords = useMemo(() => 
        order?.pickupCoordinates ? [order.pickupCoordinates.lat, order.pickupCoordinates.lng] : null,
        [order?.pickupCoordinates]
    );
    
    const deliveryCoords = useMemo(() => 
        order?.deliveryCoordinates ? [order.deliveryCoordinates.lat, order.deliveryCoordinates.lng] : null,
        [order?.deliveryCoordinates]
    );

    // Use the first available coordinates as center, or default fallback
    const mapCenter = pickupCoords || deliveryCoords || [40.7589, -73.9851];

    useEffect(() => {
        setMounted(true);
    }, []);

    // Fetch route coordinates when both pickup and delivery coordinates are available
    useEffect(() => {
        const fetchRoute = async () => {
            if (pickupCoords && deliveryCoords) {
                setIsLoadingRoute(true);
                try {
                    // Using OpenRouteService API (free alternative to Google Directions)
                    // You can also use OSRM (Open Source Routing Machine) which is completely free
                    const response = await fetch(
                        `https://router.project-osrm.org/route/v1/driving/${pickupCoords[1]},${pickupCoords[0]};${deliveryCoords[1]},${deliveryCoords[0]}?overview=full&geometries=geojson`
                    );
                    
                    const data = await response.json();
                    
                    if (data.routes && data.routes.length > 0) {
                        const routeGeometry = data.routes[0].geometry.coordinates;
                        // Convert [lng, lat] to [lat, lng] for Leaflet
                        const leafletCoords = routeGeometry.map(coord => [coord[1], coord[0]]);
                        setRouteCoordinates(leafletCoords);
                    }
                } catch (error) {
                    console.error('Error fetching route:', error);
                    // Fallback: create a simple straight line between points
                    setRouteCoordinates([pickupCoords, deliveryCoords]);
                }
                setIsLoadingRoute(false);
            }
        };

        fetchRoute();
    }, [pickupCoords, deliveryCoords]);

    if (!mounted) {
        return (
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Loading map...</p>
            </div>
        );
    }

    // Don't render map if no coordinates available
    if (!pickupCoords && !deliveryCoords) {
        return (
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Location data not available</p>
            </div>
        );
    }

    // Calculate appropriate zoom level based on distance between points
    const getMapZoom = () => {
        if (!pickupCoords || !deliveryCoords) return 13;
        
        const latDiff = Math.abs(pickupCoords[0] - deliveryCoords[0]);
        const lngDiff = Math.abs(pickupCoords[1] - deliveryCoords[1]);
        const maxDiff = Math.max(latDiff, lngDiff);
        
        if (maxDiff > 0.1) return 10;
        if (maxDiff > 0.05) return 12;
        return 13;
    };

    return (
        <div className="h-64 w-full rounded-lg overflow-hidden relative">
            {isLoadingRoute && (
                <div className="absolute top-2 right-2 z-10 bg-white px-2 py-1 rounded shadow-sm text-xs text-gray-600">
                    Loading route...
                </div>
            )}
            
            {/* Legend */}
            <div className="absolute bottom-2 left-2 z-10 bg-white/90 backdrop-blur-sm px-2 py-1 rounded shadow-sm text-xs">
                <div className="flex items-center gap-1 mb-1">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>Pickup</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span>Delivery</span>
                </div>
            </div>
            
            <MapContainer
                center={mapCenter}
                zoom={getMapZoom()}
                style={{ height: '100%', width: '100%' }}
                zoomControl={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Pickup Marker */}
                {pickupCoords && (
                    <Marker position={pickupCoords} icon={pickupIcon}>
                        <Popup>
                            <div className="text-sm">
                                <strong>📦 Pickup Location</strong>
                                <br />
                                {order?.pickupAddress || 'Pickup Address'}
                            </div>
                        </Popup>
                    </Marker>
                )}

                {/* Delivery Marker */}
                {deliveryCoords && (
                    <Marker position={deliveryCoords} icon={deliveryIcon}>
                        <Popup>
                            <div className="text-sm">
                                <strong>🏠 Delivery Location</strong>
                                <br />
                                {order?.deliveryAddress?.street || order?.deliveryAddress || 'Delivery Address'}
                            </div>
                        </Popup>
                    </Marker>
                )}

                {/* Route Line */}
                {routeCoordinates.length > 0 && (
                    <Polyline
                        positions={routeCoordinates}
                        color="#3B82F6"
                        weight={4}
                        opacity={0.8}
                        smoothFactor={1}
                    />
                )}
            </MapContainer>
        </div>
    );
}
