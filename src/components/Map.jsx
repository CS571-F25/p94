import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import PinDetailsPanel from './PinDetailsPanel';
import PinListPanel from './PinListPanel';

const STORAGE_KEY = 'dots_pins_v2';

// Ghost pin marker style
const GHOST_PIN_STYLE = {
  background: 'rgba(25, 118, 210, 0.5)',
  width: '24px',
  height: '24px',
  borderRadius: '50%',
  border: '2px solid #fff',
  boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
  cursor: 'pointer',
  pointerEvents: 'none',
  zIndex: 1000,
};

export default function Map() {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const [pins, setPins] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [modal, setModal] = useState({ show: false, lngLat: null, locationName: '', viewPin: undefined });
  const [tempPin, setTempPin] = useState(null); // {lat, lng, color}
  // Remove ghostPin state; no pin follows the mouse
  const [userLocation, setUserLocation] = useState(null);

  // Save pins to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pins));
  }, [pins]);

  // Initialize map and click handler
  useEffect(() => {
    if (mapRef.current) return;
    mapRef.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
      center: [0, 20],
      zoom: 2,
    });
    mapRef.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    // Show user location if available
    let watchId;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          mapRef.current.flyTo({ center: [pos.coords.longitude, pos.coords.latitude], zoom: 10 });
        },
        () => {},
        { enableHighAccuracy: true }
      );
      // Optionally, watch position for live updates
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {},
        { enableHighAccuracy: true }
      );
    }

    async function handleMapClick(e) {
      // Reverse geocode using Nominatim
      let locationName = '';
      try {
        const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${e.lngLat.lat}&lon=${e.lngLat.lng}&format=json`);
        if (resp.ok) {
          const data = await resp.json();
          locationName = data.display_name || '';
        }
      } catch {}
      setModal({ show: true, lngLat: e.lngLat, locationName });
      setTempPin({ lat: e.lngLat.lat, lng: e.lngLat.lng, color: '#1976d2' }); // default color, will update on save
    }
    mapRef.current.on('click', handleMapClick);

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
      mapRef.current && mapRef.current.remove();
    };
  }, []);

  // Add pins to map as markers and show user location dot
  useEffect(() => {
    if (!mapRef.current) return;
    // Remove old markers
    if (mapRef.current._pinMarkers) {
      mapRef.current._pinMarkers.forEach(m => m.remove());
    }
    // Add new markers
    mapRef.current._pinMarkers = pins.map(pin => {
      const el = document.createElement('div');
      el.className = 'maplibre-pin-marker';
      el.style.background = pin.color || '#1976d2';
      el.style.width = '24px';
      el.style.height = '24px';
      el.style.borderRadius = '50%';
      el.style.border = '2px solid #fff';
      el.style.boxShadow = '0 1px 4px rgba(0,0,0,0.15)';
      el.style.cursor = 'pointer';
      el.title = pin.name || 'Pin';
      el.onclick = (ev) => {
        ev.stopPropagation();
        setModal({ show: true, viewPin: pin });
      };
      return new maplibregl.Marker(el)
        .setLngLat([pin.lng, pin.lat])
        .addTo(mapRef.current);
    });
    // Add temp pin if modal is open for adding
    if (modal.show && modal.lngLat && !modal.viewPin && tempPin) {
      const el = document.createElement('div');
      el.className = 'maplibre-pin-marker';
      el.style.background = tempPin.color || '#1976d2';
      el.style.width = '24px';
      el.style.height = '24px';
      el.style.borderRadius = '50%';
      el.style.border = '2px solid #fff';
      el.style.boxShadow = '0 1px 4px rgba(0,0,0,0.15)';
      el.style.cursor = 'pointer';
      el.title = 'New Pin';
      if (!mapRef.current._tempPinMarker) {
        mapRef.current._tempPinMarker = new maplibregl.Marker(el, { interactive: false })
          .setLngLat([tempPin.lng, tempPin.lat])
          .addTo(mapRef.current);
      } else {
        mapRef.current._tempPinMarker.setLngLat([tempPin.lng, tempPin.lat]);
      }
    } else if (mapRef.current._tempPinMarker) {
      mapRef.current._tempPinMarker.remove();
      mapRef.current._tempPinMarker = null;
    }
    // Add user location dot
    if (userLocation) {
      const el = document.createElement('div');
      el.className = 'maplibre-user-marker';
      el.style.background = '#222';
      el.style.width = '14px';
      el.style.height = '14px';
      el.style.borderRadius = '50%';
      el.style.border = '2px solid #fff';
      el.style.boxShadow = '0 1px 4px rgba(0,0,0,0.15)';
      el.title = 'Your Location';
      if (!mapRef.current._userMarker) {
        mapRef.current._userMarker = new maplibregl.Marker(el, { interactive: false })
          .setLngLat([userLocation.lng, userLocation.lat])
          .addTo(mapRef.current);
      } else {
        mapRef.current._userMarker.setLngLat([userLocation.lng, userLocation.lat]);
      }
    }
  }, [pins, userLocation, modal, tempPin]);

    function handleSavePin(details) {
      // Always match color to category if not custom
      const DEFAULT_CATEGORIES = [
        { name: 'Food', color: '#e53935' },
        { name: 'ViewPoint', color: '#3949ab' },
        { name: 'Museum', color: '#00897b' },
        { name: 'Other', color: '#fbc02d' },
      ];
      let color = details.color;
      // If the category is a default, override color to match
      const def = DEFAULT_CATEGORIES.find(c => c.name === details.category);
      if (def && (!details.customCat || !details.customCat.trim())) {
        color = def.color;
      }
      setPins(pins => [
        ...pins,
        {
          id: Date.now(),
          lat: modal.lngLat.lat,
          lng: modal.lngLat.lng,
          locationName: modal.locationName,
          ...details,
          color,
        },
      ]);
      setTempPin(null);
      setModal({ show: false, lngLat: null, locationName: '' });
    }

  function handleCloseModal() {
    setTempPin(null);
    setModal({ show: false, lngLat: null, locationName: '', viewPin: undefined });
  }

  return (
    <div className="container py-4" style={{maxWidth: '100vw', width: '100vw'}}>
      <h2 style={{textAlign: 'left'}}>Home</h2>
      <div className="mb-2 d-flex gap-2">
        <button className="btn btn-sm btn-outline-secondary ms-auto" onClick={()=>window.location.reload()}>Reset View</button>
      </div>
      <div style={{display: 'flex', flexDirection: 'row', alignItems: 'flex-start', width: '100%', minHeight: 540, gap: 24}}>
        <div style={{flex: '0 0 380px', minWidth: 320, maxWidth: 420, maxHeight: 540, overflowY: 'auto'}}>
          {modal.show ? (
            <PinDetailsPanel
              show={modal.show}
              onClose={handleCloseModal}
              onSave={handleSavePin}
              locationName={modal.locationName}
              lat={modal.lngLat && modal.lngLat.lat}
              lng={modal.lngLat && modal.lngLat.lng}
              viewPin={modal.viewPin}
            />
          ) : (
            <PinListPanel pins={pins} setModal={setModal} />
          )}
        </div>
        <div style={{flex: 1, minWidth: 0}}>
          <div
            ref={mapContainer}
            style={{height:520, width:'100%', borderRadius:8, overflow:'hidden'}}
            id="maplibre-map"
          />
        </div>
      </div>
    </div>
  );
}


