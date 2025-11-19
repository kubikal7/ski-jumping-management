import React from 'react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIconPng from 'leaflet/dist/images/marker-icon.png';
import { useToast } from '../components/Toast';

const markerIcon = new L.Icon({
  iconUrl: markerIconPng,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'leaflet/dist/images/marker-shadow.png',
  shadowSize: [41, 41],
});

export default function HillDetails({ hill }) {
  if (!hill) return null;

  const { showToast } = useToast();

  const mapCenter = hill.latitude && hill.longitude
    ? [parseFloat(hill.latitude), parseFloat(hill.longitude)]
    : [0, 0];
  const mapZoom = hill.latitude && hill.longitude ? 8 : 2;

  const handleDirections = () => {
    if (!navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const destination = `${hill.latitude},${hill.longitude}`;
        const origin = `${latitude},${longitude}`;
        const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
        window.open(googleMapsUrl, '_blank');
      },
      (e) => {
        showToast('Nie udało się pobrać lokalizacji', 'error');
      }
    );
  };

  return (
    <div className="card">
      <div
        style={{
          flex: 1,
          minWidth: 250,
          background: '#fff',
          borderRadius: 8,
          padding: '10px'
        }}
      >
        <table className="hill-table">
          <tbody>
            <tr>
              <td className="label">Nazwa</td>
              <td>{hill.name}</td>
            </tr>
            <tr>
              <td className="label">Miasto</td>
              <td>{hill.city || '-'}</td>
            </tr>
            <tr>
              <td className="label">Kraj</td>
              <td>{hill.country || '-'}</td>
            </tr>
            <tr>
              <td className="label">HS</td>
              <td>{hill.hillSize || '-'}</td>
            </tr>
            <tr>
              <td className="label">K Punkt</td>
              <td>{hill.constructionPoint || '-'}</td>
            </tr>
          </tbody>
        </table>

        {hill.latitude && hill.longitude && (
          <button className='btn primary' onClick={handleDirections} style={{
            width: '100%',
            marginTop: '20px'
          }}>
            Jak dojechać?
          </button>
        )}
      </div>

      <div style={{ flex: 1, minWidth: 300, height: 300, padding: '10px' }}>
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          scrollWheelZoom={true}
          style={{ width: '100%', height: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {hill.latitude && hill.longitude && (
            <Marker
              position={[parseFloat(hill.latitude), parseFloat(hill.longitude)]}
              icon={markerIcon}
            />
          )}
        </MapContainer>
      </div>
    </div>
  );
}
