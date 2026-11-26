import type { LatLng } from '../components/map/LocationMap';

// Asks the browser for the current GPS location
export function getCurrentLocation(): Promise<LatLng> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('Your browser cannot share its location. Click on the map instead.'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({
          latitude: Number(position.coords.latitude.toFixed(6)),
          longitude: Number(position.coords.longitude.toFixed(6)),
        }),
      () => reject(new Error('Could not get your location. Click on the map instead.')),
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  });
}