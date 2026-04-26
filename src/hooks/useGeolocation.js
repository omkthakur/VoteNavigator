import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook: useGeolocation
 *
 * Requests the browser geolocation once, then reverse-geocodes via
 * Nominatim to get a human-readable location string.
 * Exposes a `refetch` callback so the user can retry after a denial.
 *
 * @returns {{
 *   location: { lat: number, lng: number, state: string } | null,
 *   locationStr: string,
 *   loading: boolean,
 *   error: string,
 *   refetch: () => void,
 * }}
 */
const useGeolocation = () => {
  const [location, setLocation] = useState(null);
  const [locationStr, setLocationStr] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setLoading(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000);

          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
            { signal: controller.signal }
          );
          clearTimeout(timeoutId);

          const data = await res.json();
          let str = 'India';
          let stateName = '';

          if (data?.address) {
            const city =
              data.address.city ||
              data.address.town ||
              data.address.county ||
              '';
            stateName = data.address.state || '';
            str = `${city ? city + ', ' : ''}${stateName}${stateName ? ', ' : ''}India`;
          }

          setLocation({ lat, lng, state: stateName });
          setLocationStr(str);
        } catch {
          // Geocoding failed — fall back to coordinates only
          setLocation({ lat, lng, state: '' });
          setLocationStr('India');
        } finally {
          setLoading(false);
        }
      },
      () => {
        setError('Unable to retrieve your location. Please allow location access.');
        setLoading(false);
      },
      { timeout: 10000 }
    );
  }, []);

  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  return { location, locationStr, loading, error, refetch: fetchLocation };
};

export default useGeolocation;
