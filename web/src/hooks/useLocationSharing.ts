import { useEffect, useRef, useState } from 'react';
import { getErrorMessage } from '../api/client';
import { trackingApi } from '../api/trackingApi';
import type { LatLng } from '../components/map/LocationMap';

// Send at most one GPS point every 10 seconds (saves battery and data)
const SEND_EVERY_MS = 10_000;

interface Sharing {
  position: LatLng | null;
  lastSentAt: number | null;
  sentCount: number;
  error: string | null;
}

const IDLE: Sharing = { position: null, lastSentAt: null, sentCount: 0, error: null };
const GPS_SUPPORTED = typeof navigator !== 'undefined' && 'geolocation' in navigator;

// Driver: while "active", watch the phone's GPS and send the position to the backend.
// Note: browsers only share GPS on https or on localhost.
export function useLocationSharing(active: boolean): Sharing {
  const [state, setState] = useState<Sharing>(IDLE);
  const lastSent = useRef(0);

  useEffect(() => {
    if (!active || !GPS_SUPPORTED) {
      return;
    }
    const watchId = navigator.geolocation.watchPosition(
      (geo) => {
        const position = {
          latitude: Number(geo.coords.latitude.toFixed(6)),
          longitude: Number(geo.coords.longitude.toFixed(6)),
        };
        setState((s) => ({ ...s, position, error: null }));

        const now = Date.now();
        if (now - lastSent.current < SEND_EVERY_MS) {
          return;
        }
        lastSent.current = now;
        const speed = geo.coords.speed; // metres per second, or null
        const heading = geo.coords.heading;
        trackingApi
          .sendLocation({
            ...position,
            speedKmh: speed === null ? null : Math.round(speed * 3.6 * 10) / 10,
            heading: heading === null || Number.isNaN(heading) ? null : heading,
          })
          .then(() => setState((s) => ({ ...s, lastSentAt: now, sentCount: s.sentCount + 1 })))
          .catch((error: unknown) => setState((s) => ({ ...s, error: getErrorMessage(error) })));
      },
      () => setState((s) => ({ ...s, error: 'Allow location access so the council can see the truck.' })),
      { enableHighAccuracy: true, maximumAge: 5000 },
    );
    return () => {
      navigator.geolocation.clearWatch(watchId);
      lastSent.current = 0;
    };
  }, [active]);

  if (!active) {
    return IDLE;
  }
  return GPS_SUPPORTED ? state : { ...IDLE, error: 'This browser cannot share its location.' };
}