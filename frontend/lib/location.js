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

export const geocodeAddress = async (address) => {
  try {
    const { data } = await api.get('/api/geocode', { params: { address } });
    if (data.data && data.data.lat && data.data.lng) {
      return {
        lat: parseFloat(data.data.lat),
        lng: parseFloat(data.data.lng),
        displayName: data.data.displayName
      };
    }
    throw new Error('Could not geocode address');
  } catch (error) {
    throw error.response?.data?.error || error.message || 'Geocoding failed';
  }
};
