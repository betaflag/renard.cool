/**
 * Meteo Weather Logic
 * Business logic for weather codes, clothing recommendations, and smart tips
 */

/**
 * Weather code to Lucide icon and French description mapping
 */
export const weatherCodes = {
  0: { icon: "sun", text: "Ciel dégagé" },
  1: { icon: "cloud-sun", text: "Principalement dégagé" },
  2: { icon: "cloud-sun", text: "Partiellement nuageux" },
  3: { icon: "cloud", text: "Couvert" },
  45: { icon: "cloud-fog", text: "Brouillard" },
  48: { icon: "cloud-fog", text: "Brouillard givrant" },
  51: { icon: "cloud-drizzle", text: "Bruine légère" },
  53: { icon: "cloud-drizzle", text: "Bruine modérée" },
  55: { icon: "cloud-drizzle", text: "Bruine forte" },
  56: { icon: "cloud-drizzle", text: "Bruine verglaçante légère" },
  57: { icon: "cloud-drizzle", text: "Bruine verglaçante forte" },
  61: { icon: "cloud-rain", text: "Pluie légère" },
  63: { icon: "cloud-rain", text: "Pluie modérée" },
  65: { icon: "cloud-rain", text: "Pluie forte" },
  66: { icon: "cloud-rain", text: "Pluie verglaçante légère" },
  67: { icon: "cloud-rain", text: "Pluie verglaçante forte" },
  71: { icon: "cloud-snow", text: "Chute de neige légère" },
  73: { icon: "cloud-snow", text: "Chute de neige modérée" },
  75: { icon: "cloud-snow", text: "Chute de neige forte" },
  77: { icon: "cloud-snow", text: "Grains de neige" },
  80: { icon: "cloud-drizzle", text: "Averses légères" },
  81: { icon: "cloud-rain", text: "Averses modérées" },
  82: { icon: "cloud-rain", text: "Averses violentes" },
  85: { icon: "cloud-snow", text: "Averses de neige légères" },
  86: { icon: "cloud-snow", text: "Averses de neige fortes" },
  95: { icon: "cloud-lightning", text: "Orage" },
  96: { icon: "cloud-lightning", text: "Orage avec grêle légère" },
  99: { icon: "cloud-lightning", text: "Orage avec grêle forte" },
};

/**
 * Get weather description from code
 * @param {number} code - Weather code
 * @returns {Object} { icon, text }
 */
export function getWeatherInfo(code) {
  return (
    weatherCodes[code] || {
      icon: "cloud-sun",
      text: "Conditions variables",
    }
  );
}

/**
 * Get clothing recommendations based on temperature and weather
 * @param {number} temp - Temperature in Celsius
 * @param {number} weatherCode - Weather code
 * @param {number} precipitation - Precipitation in mm
 * @param {number} windSpeed - Wind speed in km/h
 * @returns {string[]} Array of clothing recommendations
 */
export function getClothingRecommendations(
  temp,
  weatherCode,
  precipitation,
  windSpeed
) {
  const clothes = [];

  // Base clothing based on temperature
  if (temp < 5) {
    // Very cold
    clothes.push("🧥 Manteau d'hiver");
    clothes.push("🧤 Mitaines");
    clothes.push("🧣 Foulard");
    clothes.push("🎩 Tuque");
  } else if (temp < 10) {
    // Cold
    clothes.push("🧥 Manteau chaud");
    clothes.push("🧣 Foulard");
  } else if (temp < 15) {
    // Cool
    clothes.push("🧥 Manteau léger");
    clothes.push("👕 Chandail");
  } else if (temp < 20) {
    // Mild
    clothes.push("👔 Chandail léger");
    clothes.push("👕 T-shirt manches longues");
  } else if (temp < 25) {
    // Warm
    clothes.push("👕 T-shirt ou polo");
    clothes.push("👖 Pantalon léger");
  } else {
    // Hot
    clothes.push("👕 T-shirt léger");
    clothes.push("🩳 Short (si autorisé)");
    clothes.push("🧢 Casquette pour la récré");
  }

  // Add rain gear if needed
  if (
    precipitation > 0 ||
    [51, 53, 55, 61, 63, 65, 80, 81, 82].includes(weatherCode)
  ) {
    clothes.push("🌂 Imperméable");
    if (precipitation > 2) {
      clothes.push("👢 Bottes de pluie");
    }
  }

  // Add snow gear if needed
  if ([71, 73, 75, 77, 85, 86].includes(weatherCode)) {
    clothes.push("👢 Bottes d'hiver");
    clothes.push("🧤 Mitaines imperméables");
  }

  // Wind protection
  if (windSpeed > 20) {
    clothes.push("🧥 Coupe-vent");
  }

  // Sun protection for hot days
  if (temp > 25 && [0, 1].includes(weatherCode)) {
    clothes.push("🧴 Crème solaire");
  }

  return clothes;
}

/**
 * Generate smart tips based on weather conditions
 * @param {number} morningTemp - Morning temperature
 * @param {number} morningCode - Morning weather code
 * @param {number} morningPrecip - Morning precipitation
 * @param {number} afternoonTemp - Afternoon temperature
 * @param {number} afternoonCode - Afternoon weather code
 * @param {number} afternoonPrecip - Afternoon precipitation
 * @param {number} windSpeed - Max wind speed
 * @returns {string[]} Array of smart tips (max 4)
 */
export function generateSmartTips(
  morningTemp,
  morningCode,
  morningPrecip,
  afternoonTemp,
  afternoonCode,
  afternoonPrecip,
  windSpeed
) {
  const tips = [];

  // Temperature variation analysis
  const tempDiff = Math.abs(afternoonTemp - morningTemp);
  if (tempDiff > 7) {
    tips.push(
      "Grande variation de température aujourd'hui! Habillez-vous en couches pour vous adapter facilement."
    );
  } else if (morningTemp < 15 && afternoonTemp > 20) {
    tips.push(
      "Matinée fraîche mais après-midi douce - pensez aux vêtements en couches que vous pourrez retirer!"
    );
  } else if (morningTemp > 20 && afternoonTemp < 15) {
    tips.push(
      "Il fera plus frais cet après-midi - gardez une veste dans le sac à dos."
    );
  }

  // Precipitation timing tips
  const rainCodes = [51, 53, 55, 61, 63, 65, 80, 81, 82];
  const morningRain =
    rainCodes.includes(morningCode) || morningPrecip > 0;
  const afternoonRain =
    rainCodes.includes(afternoonCode) || afternoonPrecip > 0;

  if (morningRain && !afternoonRain) {
    tips.push(
      "Pluie matinale seulement - les chaussures imperméables sont essentielles au départ!"
    );
  } else if (!morningRain && afternoonRain) {
    tips.push(
      "Pluie prévue l'après-midi - n'oubliez pas l'imperméable dans le sac, même si le matin est sec!"
    );
  } else if (morningRain && afternoonRain) {
    tips.push(
      "Journée pluvieuse complète - équipement imperméable toute la journée!"
    );
  }

  // Snow conditions
  const snowCodes = [71, 73, 75, 77, 85, 86];
  if (
    snowCodes.includes(morningCode) ||
    snowCodes.includes(afternoonCode)
  ) {
    tips.push(
      "Neige au programme - bottes imperméables et vêtements chauds indispensables! Prévoyez du temps supplémentaire."
    );
  }

  // Wind conditions
  if (windSpeed > 25) {
    tips.push(
      "Vent fort aujourd'hui - un coupe-vent sera votre meilleur ami! Attention aux parapluies."
    );
  } else if (windSpeed > 15 && (morningTemp < 10 || afternoonTemp < 10)) {
    tips.push(
      "Vent et fraîcheur - le ressenti sera plus froid, couvrez-vous bien!"
    );
  }

  // Temperature extremes
  if (morningTemp > 28 || afternoonTemp > 28) {
    tips.push(
      "Forte chaleur - hydratation fréquente et protection solaire obligatoires! Casquette recommandée."
    );
  } else if (morningTemp < 0 || afternoonTemp < 0) {
    tips.push(
      "Températures négatives - protégez les extrémités! Bonnet, gants et écharpe indispensables."
    );
  }

  // Perfect weather
  if (
    !morningRain &&
    !afternoonRain &&
    morningTemp >= 18 &&
    morningTemp <= 25 &&
    afternoonTemp >= 18 &&
    afternoonTemp <= 25 &&
    windSpeed < 15
  ) {
    tips.push(
      "Conditions météo parfaites aujourd'hui - profitez de cette belle journée!"
    );
  }

  // Fog conditions
  const fogCodes = [45, 48];
  if (fogCodes.includes(morningCode)) {
    tips.push(
      "Brouillard matinal - soyez prudent sur la route et partez un peu plus tôt."
    );
  }

  // Thunderstorm warning
  const stormCodes = [95, 96, 99];
  if (
    stormCodes.includes(morningCode) ||
    stormCodes.includes(afternoonCode)
  ) {
    tips.push(
      "Orages possibles - évitez les activités extérieures et restez à l'abri!"
    );
  }

  // Return top 3-4 most relevant tips
  return tips.slice(0, 4);
}
