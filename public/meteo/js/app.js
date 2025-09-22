// ========== CONSTANTS ==========
const WEATHER_ICONS = {
  0: 'sun', 
  1: 'cloud-sun', 
  2: 'cloud-sun', 
  3: 'cloud',
  45: 'cloud-fog', 
  48: 'cloud-fog',
  51: 'cloud-drizzle', 
  53: 'cloud-drizzle', 
  55: 'cloud-rain',
  56: 'cloud-drizzle',
  57: 'cloud-drizzle',
  61: 'cloud-rain', 
  63: 'cloud-rain-wind', 
  65: 'cloud-rain-wind',
  66: 'cloud-snow',
  67: 'cloud-snow',
  71: 'cloud-snow', 
  73: 'snowflake', 
  75: 'cloud-snow',
  77: 'snowflake',
  80: 'cloud-rain',
  81: 'cloud-rain',
  82: 'cloud-rain-wind',
  85: 'cloud-snow',
  86: 'cloud-snow',
  95: 'cloud-lightning',
  96: 'cloud-lightning',
  99: 'cloud-lightning'
};

const RAIN_CODES = [51, 53, 55, 61, 63, 65, 95];
const SNOW_CODES = [71, 73, 75];
const REFRESH_INTERVAL = 30 * 60 * 1000; // 30 minutes in milliseconds

let refreshTimer = null;
let lastRefreshTime = null;

const TEMP_CATEGORIES = [
  { min: 30, name: 'hot' },
  { min: 20, name: 'warm' },
  { min: 10, name: 'mild' },
  { min: 0, name: 'cool' },
  { min: -10, name: 'cold' },
  { min: -20, name: 'veryCold' },
  { min: -Infinity, name: 'extremeCold' }
];

// ========== LANGUAGE & UI ==========
let currentLanguage = localStorage.getItem('language') || 
  (navigator.language.startsWith('fr') ? 'fr' : 'en');

let currentTheme = localStorage.getItem('theme') || 'auto';

function t(key) {
  const keys = key.split('.');
  let value = translations[currentLanguage];
  for (const k of keys) {
    value = value?.[k];
  }
  return value || key;
}

function toggleLanguage() {
  currentLanguage = currentLanguage === 'en' ? 'fr' : 'en';
  localStorage.setItem('language', currentLanguage);
  
  document.getElementById('lang-indicator').textContent = currentLanguage.toUpperCase();
  updateUILanguage();
  loadWeatherData();
  
  if (navigator.vibrate) navigator.vibrate(10);
}

function toggleTheme() {
  const themes = ['auto', 'light', 'dark'];
  const currentIndex = themes.indexOf(currentTheme);
  currentTheme = themes[(currentIndex + 1) % themes.length];
  
  localStorage.setItem('theme', currentTheme);
  applyTheme();
  
  if (navigator.vibrate) navigator.vibrate(10);
}

function applyTheme() {
  const root = document.documentElement;
  
  // Remove all theme classes
  root.classList.remove('theme-light', 'theme-dark', 'theme-auto');
  
  // Apply the appropriate theme
  if (currentTheme === 'dark') {
    root.classList.add('theme-dark');
  } else if (currentTheme === 'light') {
    root.classList.add('theme-light');
  } else {
    root.classList.add('theme-auto');
  }
}

function updateUILanguage() {
  const loadingText = document.getElementById('loading-text');
  if (loadingText) loadingText.textContent = t('loading');
  document.title = t('pageTitle');
}

function createIcon(name, size = 24, className = '') {
  return `<i data-lucide="${name}" class="lucide-icon ${className}" width="${size}" height="${size}"></i>`;
}

function formatLastRefreshTime() {
  if (!lastRefreshTime) return '';
  
  const now = new Date();
  const diff = now - lastRefreshTime;
  const minutes = Math.floor(diff / 60000);
  
  if (minutes < 1) {
    return t('justNow');
  } else if (minutes === 1) {
    return t('oneMinuteAgo');
  } else if (minutes < 60) {
    return t('minutesAgo').replace('{n}', minutes);
  } else {
    const hours = Math.floor(minutes / 60);
    if (hours === 1) {
      return t('oneHourAgo');
    } else {
      return t('hoursAgo').replace('{n}', hours);
    }
  }
}

// ========== WEATHER & RECOMMENDATIONS ==========
function getTemperatureCategory(temp) {
  return TEMP_CATEGORIES.find(cat => temp >= cat.min).name;
}

function getTemperatureSwing(minTemp, maxTemp) {
  const swing = maxTemp - minTemp;
  if (swing < 5) return 'small';
  if (swing <= 10) return 'medium';
  return 'large';
}

function getSmartRecommendations(currentTemp, minTemp, maxTemp, weatherCode) {
  const swing = maxTemp - minTemp;
  const swingCategory = getTemperatureSwing(minTemp, maxTemp);
  const isRaining = RAIN_CODES.includes(weatherCode);
  
  // Get categories for morning and current conditions
  const morningCategory = getTemperatureCategory(minTemp);
  const afternoonCategory = getTemperatureCategory(maxTemp);
  
  const recommendations = {
    temperatureSwing: swing,
    swingCategory: swingCategory,
    primaryRecommendations: {
      upperBody: null,
      lowerBody: null,
      footwear: null,
      accessories: null
    }
  };
  
  // Determine if we should use morning recommendations (for cold start) or current
  const useLayering = swing > 5 && morningCategory !== afternoonCategory;
  
  if (useLayering) {
    // Use morning recommendations when there's significant temperature swing
    recommendations.upperBody = t(`${morningCategory}.upperBody`);
    recommendations.lowerBody = t(`${morningCategory}.lowerBody`);
    recommendations.footwear = t(`${morningCategory}.footwear`);
    recommendations.accessories = t(`${morningCategory}.accessories`);
    
    // Add swing alerts and layering tips
    if (swingCategory === 'large') {
      recommendations.layeringTips = t('layeringTips.large');
      recommendations.swingAlert = t('temperatureSwingAlert.large').replace('{min}', minTemp).replace('{max}', maxTemp);
    } else if (swingCategory === 'medium') {
      recommendations.layeringTips = t('layeringTips.medium');
      recommendations.swingAlert = t('temperatureSwingAlert.medium').replace('{min}', minTemp).replace('{max}', maxTemp);
    }
    
    // Set primary recommendations for layering
    recommendations.primaryRecommendations.upperBody = 1; // Prefer middle option
    recommendations.primaryRecommendations.lowerBody = 0;
    recommendations.primaryRecommendations.accessories = 0;
  } else {
    // Use recommendations based on max temp for the day
    const targetCategory = getTemperatureCategory(Math.max(currentTemp, maxTemp));
    recommendations.upperBody = t(`${targetCategory}.upperBody`);
    recommendations.lowerBody = t(`${targetCategory}.lowerBody`);
    recommendations.footwear = t(`${targetCategory}.footwear`);
    recommendations.accessories = t(`${targetCategory}.accessories`);
    recommendations.tips = t(`${targetCategory}.tips`);
  }
  
  // Add rain-specific modifications
  if (isRaining) {
    // Add raincoat to upper body recommendations
    if (Array.isArray(recommendations.upperBody)) {
      recommendations.upperBody = [t('rainGear.raincoat'), ...recommendations.upperBody];
      recommendations.primaryRecommendations.upperBody = 0; // Raincoat is primary
    }
    
    // Replace footwear with rain boots
    if (Array.isArray(recommendations.footwear)) {
      recommendations.footwear = [t('rainGear.rainBoots'), ...recommendations.footwear.slice(0, 2)];
      recommendations.primaryRecommendations.footwear = 0; // Rain boots are primary
    }
    
    // Add umbrella to accessories
    if (Array.isArray(recommendations.accessories)) {
      recommendations.accessories = [t('rainGear.umbrella'), ...recommendations.accessories];
      recommendations.primaryRecommendations.accessories = 0; // Umbrella is primary
    }
  }
  
  // Add specific advice only if no swing alert
  if (!recommendations.swingAlert) {
    if (currentTemp >= 30) {
      recommendations.specificAdvice = t('advice.hot30plus');
    } else if (currentTemp >= 25 && currentTemp < 30) {
      recommendations.specificAdvice = t('advice.warm25to30');
    } else if (currentTemp >= 20 && currentTemp < 25) {
      recommendations.specificAdvice = t('advice.warm20to25');
    } else if (currentTemp >= 15 && currentTemp < 20) {
      recommendations.specificAdvice = t('advice.mild15to20');
    } else if (currentTemp >= 10 && currentTemp < 15) {
      recommendations.specificAdvice = t('advice.mild10to15');
    } else if (currentTemp >= 0 && currentTemp < 10 && SNOW_CODES.includes(weatherCode)) {
      recommendations.specificAdvice = t('advice.snowMild');
    } else if (currentTemp >= 0 && currentTemp < 10) {
      recommendations.specificAdvice = t('advice.cool0to10');
    } else if (currentTemp < 0 && SNOW_CODES.includes(weatherCode)) {
      recommendations.specificAdvice = t('advice.snowCold');
    } else if (currentTemp < -10) {
      recommendations.specificAdvice = t('advice.extremeCold');
    } else if (currentTemp < 0) {
      recommendations.specificAdvice = t('advice.cold');
    }
  }
  
  // Add weather alerts
  if (RAIN_CODES.includes(weatherCode)) {
    recommendations.weatherAlert = t('rainAlert');
  } else if (SNOW_CODES.includes(weatherCode)) {
    recommendations.weatherAlert = t('snowAlert');
  }
  
  return recommendations;
}

// ========== API & DATA ==========
async function getLocation() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({ lat: 43.6532, lon: -79.3832 }); // Default to Toronto
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => resolve({
        lat: position.coords.latitude,
        lon: position.coords.longitude,
      }),
      () => resolve({ lat: 43.6532, lon: -79.3832 }) // Default to Toronto
    );
  });
}

async function fetchWeatherData(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=1`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Weather data unavailable");
  return response.json();
}

async function fetchLocationName(lat, lon) {
  try {
    // Use Nominatim OpenStreetMap API for reverse geocoding (no CORS issues)
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=${currentLanguage}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data && data.address) {
      // Try to get the most relevant location name
      return data.address.city || 
             data.address.town || 
             data.address.village || 
             data.address.municipality ||
             data.address.suburb ||
             data.address.county ||
             null;
    }
  } catch (error) {
    // Silently fail - location name is optional
  }
  
  // Fallback to generic location
  return null;
}

// ========== RENDERING ==========
function renderOutfitCard(category, icon, items, primaryIndex) {
  return `
    <div class="outfit-card">
      <div class="outfit-label">
        ${createIcon(icon, 16)}
        <span>${t(category)}</span>
      </div>
      ${items.map((item, index) => {
        const isPrimary = primaryIndex === index;
        return `<div class="outfit-item ${isPrimary ? 'primary' : ''}">
          ${isPrimary ? `<span class="recommended-dot"></span>` : ''}
          <span class="item-text">${item}</span>
          ${isPrimary ? `<span class="recommended-label">${t('recommended')}</span>` : ''}
        </div>`;
      }).join("")}
    </div>
  `;
}

function renderWeatherApp(weatherData, locationName) {
  const currentTemp = Math.round(weatherData.current.temperature_2m);
  const maxTemp = Math.round(weatherData.daily.temperature_2m_max[0]);
  const minTemp = Math.round(weatherData.daily.temperature_2m_min[0]);
  const weatherCode = weatherData.current.weather_code;
  const weatherIconName = WEATHER_ICONS[weatherCode] || 'cloud-sun';

  const recommendations = getSmartRecommendations(currentTemp, minTemp, maxTemp, weatherCode);
  const weatherSection = document.getElementById('weather-section');
  const refreshTimeText = formatLastRefreshTime();
  
  weatherSection.innerHTML = `
    <!-- Weather Hero -->
    <div class="weather-hero card gradient-card gradient-blue">
      <div class="location-label">
        ${createIcon('map-pin', 14)}
        <span>${locationName || t('yourLocation')}</span>
      </div>
      <div class="weather-left">
        <div class="weather-icon-main">${createIcon(weatherIconName, 64)}</div>
      </div>
      <div class="weather-right">
        <div class="temperature-hero">${currentTemp}°</div>
        <div class="temp-range">
          ${minTemp}° / ${maxTemp}°
          ${recommendations.temperatureSwing > 8 ? 
            `<span class="swing-indicator" title="${t('temperatureSwingTooltip')}">${createIcon('trending-up', 14)}</span>` : ''}
        </div>
      </div>
      ${refreshTimeText ? `<div class="last-refresh">${t('lastRefreshed')}: ${refreshTimeText}</div>` : ''}
    </div>

    ${recommendations.weatherAlert ? `
    <div class="alert-banner">
      ${createIcon('alert-circle', 20)}
      <span>${recommendations.weatherAlert}</span>
    </div>` : ''}

    ${(recommendations.swingAlert || recommendations.specificAdvice || recommendations.layeringTips) ? `
    <div class="advice-card card gradient-card gradient-green">
      <h3 class="card-title">
        ${createIcon('sparkles', 18)}
        ${t('todayAdvice')}
      </h3>
      <div class="advice-content">
        ${recommendations.swingAlert ? `
          <div class="advice-item">
            ${createIcon('thermometer', 16)}
            <span>${recommendations.swingAlert}</span>
          </div>
        ` : ''}
        ${recommendations.specificAdvice ? `
          <div class="advice-item">
            ${createIcon('lightbulb', 16)}
            <span>${recommendations.specificAdvice}</span>
          </div>
        ` : ''}
        ${recommendations.layeringTips ? `
          <div class="advice-item">
            ${createIcon('layers-3', 16)}
            <span>${recommendations.layeringTips}</span>
          </div>
        ` : ''}
      </div>
    </div>` : ''}

    ${recommendations.tips ? `
    <!-- Smart Tips Section -->
    <div class="tips-section card gradient-card gradient-yellow">
      <h3 class="card-title">
        ${createIcon('lightbulb', 18)}
        ${t('smartTips')}
      </h3>
      ${recommendations.tips.map((tip, index) => `
        <div class="tip-item">
          <div class="tip-icon">${index + 1}</div>
          <div class="tip-text">${tip}</div>
        </div>
      `).join("")}
    </div>
    ` : ''}

    <!-- Clothing Section -->
    <div class="clothing-section">
      <h2 class="section-heading">${t('whatToWear')}</h2>
      ${renderOutfitCard('upperBody', 'shirt', recommendations.upperBody, recommendations.primaryRecommendations.upperBody)}
      ${renderOutfitCard('lowerBody', 'arrow-down', recommendations.lowerBody, recommendations.primaryRecommendations.lowerBody)}
      ${renderOutfitCard('footwear', 'footprints', recommendations.footwear, recommendations.primaryRecommendations.footwear)}
      ${renderOutfitCard('accessories', 'backpack', recommendations.accessories, recommendations.primaryRecommendations.accessories)}
    </div>

  `;
  
  lucide.createIcons();
}

function showError(message) {
  const weatherSection = document.getElementById('weather-section');
  weatherSection.innerHTML = `
    <div class="error-container">
      <div class="error-icon">${createIcon('alert-triangle', 48)}</div>
      <h3 class="error-title">${t('errorTitle')}</h3>
      <p class="error-message">${message}</p>
      <p class="error-message">${t('errorHint')}</p>
    </div>
  `;
  lucide.createIcons();
}

async function loadWeatherData() {
  const weatherSection = document.getElementById('weather-section');
  weatherSection.innerHTML = `
    <div class="loading">
      <div class="loading-spinner">${createIcon('sun', 48, 'spin')}</div>
      <p class="loading-text">${t('loading')}</p>
    </div>
  `;
  lucide.createIcons();

  try {
    const location = await getLocation();
    const [weatherData, locationName] = await Promise.all([
      fetchWeatherData(location.lat, location.lon),
      fetchLocationName(location.lat, location.lon)
    ]);
    
    // Update last refresh time
    lastRefreshTime = new Date();
    
    // Clear existing timer and set new one
    if (refreshTimer) {
      clearInterval(refreshTimer);
    }
    refreshTimer = setInterval(() => {
      loadWeatherData();
    }, REFRESH_INTERVAL);
    
    renderWeatherApp(weatherData, locationName);
    
    // Update refresh time display every minute
    setInterval(() => {
      const refreshElement = document.querySelector('.last-refresh');
      if (refreshElement) {
        const refreshTimeText = formatLastRefreshTime();
        if (refreshTimeText) {
          refreshElement.textContent = `${t('lastRefreshed')}: ${refreshTimeText}`;
        }
      }
    }, 60000); // Update every minute
    
  } catch {
    showError(t('errorMessage'));
  }
}

// ========== INITIALIZATION ==========
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById('lang-indicator').textContent = currentLanguage.toUpperCase();
  updateUILanguage();
  applyTheme();
  lucide.createIcons();
  loadWeatherData();
  
  // Hidden console testing function
  window.testWeather = function(options) {
    // Handle preset scenarios
    if (typeof options === 'string') {
      const presets = {
        'rain': { current: 15, min: 12, max: 18, code: 61, location: 'Rainy Test' },
        'heavy-rain': { current: 20, min: 18, max: 23, code: 65, location: 'Heavy Rain Test' },
        'snow': { current: -5, min: -8, max: -2, code: 73, location: 'Snowy Test' },
        'hot': { current: 35, min: 28, max: 38, code: 0, location: 'Hot Test' },
        'cold': { current: -15, min: -20, max: -10, code: 0, location: 'Cold Test' },
        'extreme-cold': { current: -25, min: -30, max: -20, code: 77, location: 'Extreme Cold Test' },
        'swing': { current: 18, min: 8, max: 24, code: 1, location: 'Swing Test' },
        'rain-cold': { current: 2, min: -1, max: 4, code: 55, location: 'Cold Rain Test' },
        'rain-hot': { current: 28, min: 25, max: 32, code: 80, location: 'Hot Rain Test' }
      };
      
      if (presets[options]) {
        options = presets[options];
      } else {
        return `Available presets: ${Object.keys(presets).join(', ')}`;
      }
    }
    
    // Default options
    const defaults = {
      current: 15,
      min: null,
      max: null,
      code: 0,
      location: 'Test Location'
    };
    
    const config = { ...defaults, ...options };
    
    // Auto-calculate min/max if not provided
    if (config.min === null) config.min = config.current - 5;
    if (config.max === null) config.max = config.current + 5;
    
    // Create mock weather data
    const mockWeatherData = {
      current: {
        temperature_2m: config.current,
        weather_code: config.code
      },
      daily: {
        temperature_2m_max: [config.max],
        temperature_2m_min: [config.min]
      }
    };
    
    // Update last refresh time
    lastRefreshTime = new Date();
    
    // Render with mock data
    renderWeatherApp(mockWeatherData, config.location);
    
    return `Weather test rendered: ${config.location}`;
  };
  
});