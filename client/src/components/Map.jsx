import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default Leaflet icon using CDN to avoid bundler issues
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Sub-component to handle map centering updates
const MapUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
};

const Map = ({ requests, userLocation }) => {
  const center = userLocation ? [userLocation.lat, userLocation.lng] : [12.9716, 77.5946];

  // Helper to create custom colored icons
  const createColorIcon = (color) => {
    const html = `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3);"></div>`;
    return L.divIcon({
      className: 'custom-icon',
      html: html,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    });
  };

  return (
    <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%", borderRadius: "0.75rem" }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapUpdater center={center} />

      {/* User Location Marker (if available) */}
      {userLocation && (
        <Marker position={[userLocation.lat, userLocation.lng]}>
          <Popup>You are here</Popup>
        </Marker>
      )}

      {/* Only show markers for active requests (not resolved) */}
      {requests.filter(req => req.status !== 'resolved').map(req => {
        const color = req.urgency === 'critical' ? '#ef4444' :
          req.urgency === 'high' ? '#f97316' :
            req.urgency === 'medium' ? '#eab308' : '#22c55e';

        return (
          <Marker
            key={req._id}
            position={[req.location.lat, req.location.lng]}
            icon={createColorIcon(color)}
          >
            <Popup>
              <div className="p-1">
                <h3 className="font-bold text-base">{req.title}</h3>
                <p className="text-sm my-1">{req.description}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs uppercase font-bold px-2 py-0.5 rounded text-white" style={{ backgroundColor: color }}>
                    {req.urgency}
                  </span>
                  <span className="text-xs text-slate-500">{req.category}</span>
                </div>
                <div className="mt-2 text-xs">
                  <span className={`px-2 py-0.5 rounded font-bold uppercase ${req.status === 'in-progress' ? 'bg-blue-500 text-white' : 'bg-yellow-500 text-black'
                    }`}>
                    {req.status === 'in-progress' ? 'IN PROGRESS' : 'PENDING'}
                  </span>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default Map;
