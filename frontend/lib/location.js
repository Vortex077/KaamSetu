import api from './api';

export const getMyLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          reject(error);
        }
      );
    }
  });
};

export const geocodeAddress = async (q) => {
  try {
    const { data } = await api.get('/api/geocode', { params: { q } });
    if (data.data && data.data.length > 0) {
      const first = data.data[0];
      return {
        lat: parseFloat(first.lat),
        lng: parseFloat(first.lon),
        displayName: first.displayName
      };
    }
    throw new Error('Could not geocode address');
  } catch (error) {
    throw error.response?.data?.error || error.message || 'Geocoding failed';
  }
};

export const reverseGeocode = async (lat, lon) => {
  try {
    const { data } = await api.get('/api/geocode', { params: { lat, lon } });
    if (data.data && data.data.length > 0) {
      const first = data.data[0];
      return {
        lat: parseFloat(first.lat),
        lng: parseFloat(first.lon),
        displayName: first.displayName
      };
    }
    throw new Error('Could not find address for these coordinates');
  } catch (error) {
    throw error.response?.data?.error || error.message || 'Reverse geocoding failed';
  }
};
