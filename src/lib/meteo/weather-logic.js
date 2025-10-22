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
 * Clothing item with optional icon
 * @typedef {Object} ClothingItem
 * @property {string} text - Display text
 * @property {string} emoji - Emoji fallback
 * @property {string|null} icon - Path to PNG icon (relative to /meteo/icons/)
 */

/**
 * Get clothing recommendations based on temperature and weather
 * @param {number} temp - Temperature in Celsius
 * @param {number} weatherCode - Weather code
 * @param {number} precipitation - Precipitation in mm
 * @param {number} windSpeed - Wind speed in km/h
 * @returns {ClothingItem[]} Array of clothing recommendations
 */
export function getClothingRecommendations(
  temp,
  weatherCode,
  precipitation,
  windSpeed
) {
  const clothes = [];

  // Helper function to create clothing item
  const item = (text, emoji, icon = null) => ({ text, emoji, icon });

  // Base clothing based on temperature
  if (temp < 5) {
    // Very cold
    clothes.push(item("Manteau d'hiver", "🧥", "manteau-hiver.png"));
    clothes.push(item("Mitaines", "🧤", "mitaines.png"));
    clothes.push(item("Foulard", "🧣", "foulard.png"));
    clothes.push(item("Tuque", "🎩", "tuque.png"));
  } else if (temp < 10) {
    // Cold
    clothes.push(item("Manteau chaud", "🧥", "manteau-chaud.png"));
    clothes.push(item("Foulard", "🧣", "foulard.png"));
  } else if (temp < 15) {
    // Cool
    clothes.push(item("Manteau léger", "🧥", "manteau-leger.png"));
    clothes.push(item("Chandail", "👕", "chandail.png"));
  } else if (temp < 20) {
    // Mild
    clothes.push(item("Chandail léger", "👔", null));
    clothes.push(item("T-shirt manches longues", "👕", null));
  } else if (temp < 25) {
    // Warm
    clothes.push(item("T-shirt ou polo", "👕", null));
    clothes.push(item("Pantalon léger", "👖", null));
  } else {
    // Hot
    clothes.push(item("T-shirt léger", "👕", null));
    clothes.push(item("Short (si autorisé)", "🩳", null));
    clothes.push(item("Casquette pour la récré", "🧢", null));
  }

  // Add rain gear if needed
  if (
    precipitation > 0 ||
    [51, 53, 55, 61, 63, 65, 80, 81, 82].includes(weatherCode)
  ) {
    clothes.push(item("Imperméable", "🌂", "imperméable.png"));
    if (precipitation > 2) {
      clothes.push(item("Bottes de pluie", "👢", "bottes-pluie.png"));
    }
  }

  // Add snow gear if needed
  if ([71, 73, 75, 77, 85, 86].includes(weatherCode)) {
    clothes.push(item("Bottes d'hiver", "👢", null));
    clothes.push(item("Mitaines imperméables", "🧤", "mitaines.png"));
  }

  // Wind protection
  if (windSpeed > 20) {
    clothes.push(item("Coupe-vent", "🧥", "coupe-vent.png"));
  }

  // Sun protection for hot days
  if (temp > 25 && [0, 1].includes(weatherCode)) {
    clothes.push(item("Crème solaire", "🧴", null));
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
 * @param {number|null} eveningTemp - Evening temperature (optional)
 * @param {number|null} eveningCode - Evening weather code (optional)
 * @param {number|null} eveningPrecip - Evening precipitation (optional)
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
  eveningTemp,
  eveningCode,
  eveningPrecip,
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
  const morningRain = rainCodes.includes(morningCode) || morningPrecip > 0;
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
  if (snowCodes.includes(morningCode) || snowCodes.includes(afternoonCode)) {
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
    stormCodes.includes(afternoonCode) ||
    (eveningCode && stormCodes.includes(eveningCode))
  ) {
    tips.push(
      "Orages possibles - évitez les activités extérieures et restez à l'abri!"
    );
  }

  // Evening-specific tips
  if (eveningTemp !== null && eveningTemp !== undefined) {
    // Evening cooling
    if (afternoonTemp > 20 && eveningTemp < 15) {
      tips.push(
        "Refroidissement en soirée - prévoyez une veste pour les activités du soir!"
      );
    } else if (afternoonTemp - eveningTemp > 8) {
      tips.push(
        "Température en baisse notable en soirée - habillez-vous chaudement pour rentrer!"
      );
    }

    // Evening rain
    const eveningRain =
      eveningPrecip > 0 || (eveningCode && rainCodes.includes(eveningCode));
    if (!afternoonRain && eveningRain) {
      tips.push(
        "Pluie prévue en soirée - gardez l'imperméable pour le retour à la maison!"
      );
    } else if (afternoonRain && !eveningRain) {
      tips.push(
        "La pluie devrait s'arrêter en soirée - soirée plus agréable en vue!"
      );
    }

    // Evening cold
    if (eveningTemp < 5 && afternoonTemp > 10) {
      tips.push(
        "Soirée froide en perspective - manteau chaud indispensable pour les activités du soir!"
      );
    }
  }

  // Return top 3-4 most relevant tips
  return tips.slice(0, 4);
}
