/**
 * Meteo API Calls
 * Handles API requests to Open-Meteo and Nominatim
 */

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
      `current=temperature_2m,apparent_temperature,weathercode,windspeed_10m,wind_direction_10m,wind_gusts_10m,precipitation,relative_humidity_2m,pressure_msl,visibility,cloud_cover,uv_index,is_day&` +
      `hourly=temperature_2m,apparent_temperature,weathercode,precipitation,windspeed_10m&` +
      `daily=weathercode,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_sum,uv_index_max&` +
      `timezone=auto&` +
      `forecast_days=5`;

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
