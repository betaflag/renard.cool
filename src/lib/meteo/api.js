/**
 * Meteo API Calls
 * Handles API requests to Open-Meteo and Nominatim
 */

/**
 * Search for cities by name using Nominatim
 * @param {string} query - City name to search
 * @returns {Promise<Array>} Array of city results
 */
export async function searchCities(query) {
  try {
    if (!query || query.length < 2) {
      return [];
    }

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&accept-language=fr&addressdetails=1`
    );
    const data = await response.json();

    // Filter and format results to only include cities/towns
    return data
      .filter(item => {
        const type = item.type || item.addresstype;
        return ['city', 'town', 'village', 'municipality', 'administrative'].includes(type);
      })
      .map(item => ({
        name: item.name,
        displayName: item.display_name,
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
        country: item.address?.country || '',
        state: item.address?.state || '',
      }));
  } catch (error) {
    console.error("Error searching cities:", error);
    return [];
  }
}

/**
 * Get city name from coordinates using Nominatim
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<string>} City name
 */
export async function getCityName(lat, lon) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=fr`
    );
    const data = await response.json();

    const city =
      data.address?.city ||
      data.address?.town ||
      data.address?.village ||
      data.address?.municipality ||
      data.address?.suburb ||
      data.display_name?.split(",")[0] ||
      `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`;

    return city;
  } catch (error) {
    console.error("Error getting city name:", error);
    return `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`;
  }
}

/**
 * Fetch weather data from Open-Meteo API
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<Object>} Weather data
 */
export async function fetchWeather(lat, lon) {
  try {
    const apiUrl =
      `https://api.open-meteo.com/v1/forecast?` +
      `latitude=${lat}&` +
      `longitude=${lon}&` +
      `current=temperature_2m,apparent_temperature,weathercode,windspeed_10m,wind_direction_10m,wind_gusts_10m,precipitation,relative_humidity_2m,cloud_cover,uv_index,is_day&` +
      `hourly=temperature_2m,apparent_temperature,weathercode,precipitation,precipitation_probability,windspeed_10m,relative_humidity_2m&` +
      `daily=weathercode,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_sum,precipitation_probability_max,uv_index_max&` +
      `timezone=auto&` +
      `forecast_days=11`;

    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error("Erreur lors de la récupération des données météo");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching weather:", error);
    throw error;
  }
}
