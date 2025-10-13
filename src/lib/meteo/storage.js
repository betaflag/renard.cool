/**
 * Meteo Location Storage Manager
 * Manages localStorage for weather location persistence
 */

const LOCATION_STORAGE_KEY = "meteo-renard-location";

/**
 * Save location to localStorage
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {string} cityName - City name
 */
export function saveLocation(lat, lon, cityName) {
  if (typeof window === 'undefined') return;

  try {
    const locationData = {
      latitude: lat,
      longitude: lon,
      cityName: cityName,
      timestamp: Date.now(),
    };
    localStorage.setItem(
      LOCATION_STORAGE_KEY,
      JSON.stringify(locationData)
    );
  } catch (error) {
    console.error("Error saving location:", error);
  }
}

/**
 * Load location from localStorage
 * @returns {Object|null} Location data or null
 */
export function loadLocation() {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(LOCATION_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Error loading stored location:", error);
    clearStoredLocation();
  }
  return null;
}

/**
 * Clear stored location
 */
export function clearStoredLocation() {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(LOCATION_STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing location:", error);
  }
}
