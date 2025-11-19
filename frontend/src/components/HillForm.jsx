import React, { useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIconPng from 'leaflet/dist/images/marker-icon.png';

const markerIcon = new L.Icon({
  iconUrl: markerIconPng,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'leaflet/dist/images/marker-shadow.png',
  shadowSize: [41, 41],
});

function LocationSelector({ position, onChange }) {
  useMapEvents({
    click(e) {
      onChange({ lat: e.latlng.lat, lng: e.latlng.lng });
    }
  });

  return position ? <Marker position={position} icon={markerIcon} /> : null;
}

export default function HillForm({ onSubmit, initialData = {} }) {
  const [hill, setHill] = useState({
    name: '',
    city: '',
    country: '',
    hillSize: '',
    constructionPoint: '',
    latitude: '',
    longitude: '',
    ...initialData
  });

  const handleMapClick = useCallback(async ({ lat, lng }) => {
    setHill(prev => ({ ...prev, latitude: lat, longitude: lng }));

    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
      const resp = await fetch(url, {
        headers: {
          'User-Agent': 'TwojaAplikacja/1.0 (twoj@email.example)'
        }
      });
      if (!resp.ok) throw new Error('Reverse geocoding failed');
      const data = await resp.json();

      const address = data.address || {};
      const city = address.city || address.town || address.village || address.hamlet || '';
      const country = address.country || '';

      setHill(prev => ({ ...prev, city, country }));
    } catch (err) {
      console.warn('Nominatim error:', err);
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(hill);
  };

  const position = (hill.latitude && hill.longitude)
    ? [parseFloat(hill.latitude), parseFloat(hill.longitude)]
    : null;

  const defaultCenter = [0, 0];
  const mapCenter = (hill.latitude && hill.longitude)
    ? [parseFloat(hill.latitude), parseFloat(hill.longitude)]
    : defaultCenter;

  return (
    <form onSubmit={handleSubmit} className="column">
      <input
        className="input"
        placeholder="Nazwa"
        value={hill.name}
        onChange={e => setHill({ ...hill, name: e.target.value })}
      />
      <input
        className="input"
        placeholder="Miasto"
        value={hill.city}
        onChange={e => setHill({ ...hill, city: e.target.value })}
      />
      <input
        className="input"
        placeholder="Kraj"
        value={hill.country}
        onChange={e => setHill({ ...hill, country: e.target.value })}
      />
      <input
        className="input"
        type="number"
        placeholder="Rozmiar skoczni (HS)"
        value={hill.hillSize || ''}
        onChange={e => setHill({ ...hill, hillSize: e.target.value })}
      />
      <input
        className="input"
        type="number"
        placeholder="Punkt k"
        value={hill.constructionPoint || ''}
        onChange={e => setHill({ ...hill, constructionPoint: e.target.value })}
      />

      <div className='column' style={{height: 300}}>
        <label>Wybierz lokalizację na mapie (kliknij):</label>
        <MapContainer
          center={mapCenter}
          zoom={6}
          style={{ width: '100%', height: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <LocationSelector position={position} onChange={handleMapClick} />
        </MapContainer>
        <p>Wybrane współrzędne: {hill.latitude || '—'}, {hill.longitude || '—'}</p>
      </div>

      <button type="submit" className="btn primary">Zapisz</button>
    </form>
  );
}
