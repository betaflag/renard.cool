/**
 * Meteo DOM Updates
 * Functions to update the UI with weather data
 */

import { getWeatherInfo, getClothingRecommendations, generateSmartTips } from './weather-logic.js';
import { formatTime } from './utils.js';
import React from 'react';
import ReactDOM from 'react-dom/client';
import HourlyChart from '../../components/meteo/HourlyChart.tsx';


/**
 * Show loading state
 */
export function showLoading() {
  const loadingEl = document.getElementById("loading");
  if (loadingEl) {
    loadingEl.classList.remove("hidden");
  }
}

/**
 * Hide loading state
 */
export function hideLoading() {
  const loadingEl = document.getElementById("loading");
  if (loadingEl) {
    loadingEl.classList.add("hidden");
  }
}

/**
 * Show error message
 * @param {string} message - Error message to display
 */
export function showError(message) {
  const errorDiv = document.getElementById("error-message");
  if (errorDiv) {
    const messageEl = errorDiv.querySelector("p");
    if (messageEl) {
      messageEl.textContent = message;
    }
    errorDiv.classList.remove("hidden");
  }
  hideLoading();
}

/**
 * Hide error message
 */
export function hideError() {
  const errorDiv = document.getElementById("error-message");
  if (errorDiv) {
    errorDiv.classList.add("hidden");
  }
}

/**
 * Helper function to convert wind direction degrees to cardinal direction
 * @param {number} degrees - Wind direction in degrees
 * @returns {string} Cardinal direction (N, NE, E, etc.)
 */
function getWindDirection(degrees) {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
  const index = Math.round(((degrees % 360) / 45)) % 8;
  return directions[index];
}

/**
 * Update current weather display with enriched data
 * @param {Object} data - Weather API data
 */
export function updateCurrentWeather(data) {
  const current = data.current;
  const daily = data.daily;
  const weatherInfo = getWeatherInfo(current.weathercode);

  // Update temperature
  const tempValueEl = document.querySelector(".temp-value");
  if (tempValueEl) {
    tempValueEl.textContent = Math.round(current.temperature_2m);
  }

  // Update weather icon and description
  const iconElement = document.querySelector(".weather-icon-main");
  if (iconElement) {
    iconElement.setAttribute("data-lucide", weatherInfo.icon);
  }

  const weatherTextEl = document.querySelector(".weather-text");
  if (weatherTextEl) {
    weatherTextEl.textContent = weatherInfo.text;
  }

  // Update min/max temperatures
  const tempMaxEl = document.querySelector(".temp-max");
  if (tempMaxEl && daily.temperature_2m_max) {
    tempMaxEl.textContent = `Max: ${Math.round(daily.temperature_2m_max[0])}°`;
  }

  const tempMinEl = document.querySelector(".temp-min");
  if (tempMinEl && daily.temperature_2m_min) {
    tempMinEl.textContent = `Min: ${Math.round(daily.temperature_2m_min[0])}°`;
  }

  // Generate and display badges
  const badges = [];
  if (current.precipitation > 0.5) {
    badges.push('<span class="weather-badge badge-rain"><i data-lucide="cloud-rain" class="badge-icon"></i>Pluie</span>');
  }
  if (current.windspeed_10m > 30) {
    badges.push('<span class="weather-badge badge-wind"><i data-lucide="wind" class="badge-icon"></i>Vent fort</span>');
  }

  const badgesContainer = document.querySelector(".current-badges");
  if (badgesContainer) {
    badgesContainer.innerHTML = badges.join('');
  }

  // Update wind with direction
  const windSpeedEl = document.querySelector(".wind-speed");
  if (windSpeedEl) {
    const windSpeed = Math.round(current.windspeed_10m);
    const windGusts = current.wind_gusts_10m ? Math.round(current.wind_gusts_10m) : null;
    windSpeedEl.textContent = windGusts && windGusts > windSpeed
      ? `${windSpeed} km/h (rafales ${windGusts})`
      : `${windSpeed} km/h`;
  }

  const windDirectionEl = document.querySelector(".wind-direction");
  if (windDirectionEl && current.wind_direction_10m !== undefined) {
    windDirectionEl.textContent = `Direction: ${getWindDirection(current.wind_direction_10m)}`;
  }

  // Update humidity with progress bar
  const humidityEl = document.querySelector(".humidity");
  if (humidityEl && current.relative_humidity_2m !== undefined) {
    humidityEl.textContent = `${Math.round(current.relative_humidity_2m)}%`;
  }

  const humidityFillEl = document.querySelector(".humidity-fill");
  if (humidityFillEl && current.relative_humidity_2m !== undefined) {
    setTimeout(() => {
      humidityFillEl.style.width = `${current.relative_humidity_2m}%`;
    }, 100);
  }

  // Update feels like
  const feelsLikeEl = document.querySelector(".feels-like-value");
  if (feelsLikeEl) {
    feelsLikeEl.textContent = `${Math.round(current.apparent_temperature)}°C`;
  }

  // Update precipitation
  const precipitationEl = document.querySelector(".precipitation");
  if (precipitationEl) {
    precipitationEl.textContent = `${current.precipitation.toFixed(1)} mm`;
  }

  // Update sunrise and sunset
  if (daily.sunrise && daily.sunset) {
    const sunriseEl = document.querySelector(".sunrise");
    if (sunriseEl) {
      sunriseEl.textContent = formatTime(daily.sunrise[0]);
    }

    const sunsetEl = document.querySelector(".sunset");
    if (sunsetEl) {
      sunsetEl.textContent = formatTime(daily.sunset[0]);
    }
  }

  // Show the section
  const currentWeatherEl = document.getElementById("current-weather");
  if (currentWeatherEl) {
    currentWeatherEl.classList.remove("hidden");
  }

  // Refresh Lucide icons (including new badge icons)
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

/**
 * Update today's AM/PM forecast
 * @param {Object} data - Weather API data
 */
export function updateTodayForecast(data) {
  if (!data.hourly || !data.hourly.time) return;

  const now = new Date();
  const todayDate = now.toISOString().split("T")[0];

  // Find today's hourly data
  const todayIndices = [];
  data.hourly.time.forEach((time, index) => {
    if (time.startsWith(todayDate)) {
      todayIndices.push(index);
    }
  });

  if (todayIndices.length === 0) return;

  // Morning hours (8-12)
  const morningHours = [8, 9, 10, 11];
  const morningIndices = todayIndices.filter((i) => {
    const hour = new Date(data.hourly.time[i]).getHours();
    return morningHours.includes(hour);
  });

  // Afternoon hours (12-17)
  const afternoonHours = [12, 13, 14, 15, 16];
  const afternoonIndices = todayIndices.filter((i) => {
    const hour = new Date(data.hourly.time[i]).getHours();
    return afternoonHours.includes(hour);
  });

  // Evening hours (18-21)
  const eveningHours = [18, 19, 20];
  const eveningIndices = todayIndices.filter((i) => {
    const hour = new Date(data.hourly.time[i]).getHours();
    return eveningHours.includes(hour);
  });

  // Calculate morning averages and update card
  if (morningIndices.length > 0) {
    const morningRealTemps = morningIndices.map(
      (i) => data.hourly.temperature_2m[i]
    );
    const morningFeelsLikeTemps = morningIndices.map(
      (i) =>
        data.hourly.apparent_temperature[i] ||
        data.hourly.temperature_2m[i]
    );
    const morningAvgTemp =
      morningRealTemps.reduce((a, b) => a + b, 0) / morningRealTemps.length;
    const morningAvgFeelsLike =
      morningFeelsLikeTemps.reduce((a, b) => a + b, 0) / morningFeelsLikeTemps.length;
    const morningWeatherCode =
      data.hourly.weathercode[
        morningIndices[Math.floor(morningIndices.length / 2)]
      ];
    const morningPrecipitation = Math.max(
      ...morningIndices.map((i) => data.hourly.precipitation[i] || 0)
    );
    const morningWind = Math.max(
      ...morningIndices.map((i) => data.hourly.windspeed_10m[i] || 0)
    );
    const morningWeather = getWeatherInfo(morningWeatherCode);

    // Update morning card
    const morningTempEl = document.querySelector(
      ".morning-card .period-temp-value"
    );
    if (morningTempEl) {
      morningTempEl.textContent = Math.round(morningAvgTemp);
    }

    // Update morning feels-like
    const morningFeelsLikeEl = document.querySelector(".morning-feels-like");
    if (morningFeelsLikeEl) {
      morningFeelsLikeEl.textContent = `${Math.round(morningAvgFeelsLike)}°C`;
    }

    const morningIconEl = document.querySelector(".morning-card .period-weather-icon");
    if (morningIconEl) {
      morningIconEl.setAttribute("data-lucide", morningWeather.icon);
    }

    const morningTextEl = document.querySelector(
      ".morning-card .period-weather-text"
    );
    if (morningTextEl) {
      morningTextEl.textContent = morningWeather.text;
    }

    // Update morning precipitation and wind
    const morningPrecipEl = document.querySelector(".morning-precipitation");
    const morningPrecipBox = document.querySelector(".morning-precipitation-box");
    if (morningPrecipEl) {
      morningPrecipEl.textContent = `${morningPrecipitation.toFixed(1)} mm`;
      // Hide precipitation if it's 0.0
      if (morningPrecipBox && morningPrecipitation === 0) {
        morningPrecipBox.classList.add("hidden");
      } else if (morningPrecipBox) {
        morningPrecipBox.classList.remove("hidden");
      }
    }

    const morningWindEl = document.querySelector(".morning-wind");
    if (morningWindEl) {
      morningWindEl.textContent = `${Math.round(morningWind)} km/h`;
    }

    // Get and display morning clothing recommendations
    const morningClothes = getClothingRecommendations(
      morningAvgTemp,
      morningWeatherCode,
      morningPrecipitation,
      morningWind
    );
    const morningClothingList = document.querySelector(
      ".morning-card .clothing-list"
    );
    if (morningClothingList) {
      morningClothingList.innerHTML = morningClothes
        .map((item) => {
          if (item.icon) {
            return `<div class="clothing-item">
              <img src="/meteo/icons/${item.icon}" alt="${item.text}" class="clothing-icon-img" />
              <span>${item.text}</span>
            </div>`;
          } else {
            return `<div class="clothing-item">${item.emoji} ${item.text}</div>`;
          }
        })
        .join("");
    }
  }

  // Calculate afternoon averages and update card
  if (afternoonIndices.length > 0) {
    const afternoonRealTemps = afternoonIndices.map(
      (i) => data.hourly.temperature_2m[i]
    );
    const afternoonFeelsLikeTemps = afternoonIndices.map(
      (i) =>
        data.hourly.apparent_temperature[i] ||
        data.hourly.temperature_2m[i]
    );
    const afternoonAvgTemp =
      afternoonRealTemps.reduce((a, b) => a + b, 0) / afternoonRealTemps.length;
    const afternoonAvgFeelsLike =
      afternoonFeelsLikeTemps.reduce((a, b) => a + b, 0) / afternoonFeelsLikeTemps.length;
    const afternoonWeatherCode =
      data.hourly.weathercode[
        afternoonIndices[Math.floor(afternoonIndices.length / 2)]
      ];
    const afternoonPrecipitation = Math.max(
      ...afternoonIndices.map((i) => data.hourly.precipitation[i] || 0)
    );
    const afternoonWind = Math.max(
      ...afternoonIndices.map((i) => data.hourly.windspeed_10m[i] || 0)
    );
    const afternoonWeather = getWeatherInfo(afternoonWeatherCode);

    // Update afternoon card
    const afternoonTempEl = document.querySelector(
      ".afternoon-card .period-temp-value"
    );
    if (afternoonTempEl) {
      afternoonTempEl.textContent = Math.round(afternoonAvgTemp);
    }

    // Update afternoon feels-like
    const afternoonFeelsLikeEl = document.querySelector(".afternoon-feels-like");
    if (afternoonFeelsLikeEl) {
      afternoonFeelsLikeEl.textContent = `${Math.round(afternoonAvgFeelsLike)}°C`;
    }

    const afternoonIconEl = document.querySelector(".afternoon-card .period-weather-icon");
    if (afternoonIconEl) {
      afternoonIconEl.setAttribute("data-lucide", afternoonWeather.icon);
    }

    const afternoonTextEl = document.querySelector(
      ".afternoon-card .period-weather-text"
    );
    if (afternoonTextEl) {
      afternoonTextEl.textContent = afternoonWeather.text;
    }

    // Update afternoon precipitation and wind
    const afternoonPrecipEl = document.querySelector(".afternoon-precipitation");
    const afternoonPrecipBox = document.querySelector(".afternoon-precipitation-box");
    if (afternoonPrecipEl) {
      afternoonPrecipEl.textContent = `${afternoonPrecipitation.toFixed(1)} mm`;
      // Hide precipitation if it's 0.0
      if (afternoonPrecipBox && afternoonPrecipitation === 0) {
        afternoonPrecipBox.classList.add("hidden");
      } else if (afternoonPrecipBox) {
        afternoonPrecipBox.classList.remove("hidden");
      }
    }

    const afternoonWindEl = document.querySelector(".afternoon-wind");
    if (afternoonWindEl) {
      afternoonWindEl.textContent = `${Math.round(afternoonWind)} km/h`;
    }

    // Get and display afternoon clothing recommendations
    const afternoonClothes = getClothingRecommendations(
      afternoonAvgTemp,
      afternoonWeatherCode,
      afternoonPrecipitation,
      afternoonWind
    );
    const afternoonClothingList = document.querySelector(
      ".afternoon-card .clothing-list"
    );
    if (afternoonClothingList) {
      afternoonClothingList.innerHTML = afternoonClothes
        .map((item) => {
          if (item.icon) {
            return `<div class="clothing-item">
              <img src="/meteo/icons/${item.icon}" alt="${item.text}" class="clothing-icon-img" />
              <span>${item.text}</span>
            </div>`;
          } else {
            return `<div class="clothing-item">${item.emoji} ${item.text}</div>`;
          }
        })
        .join("");
    }
  }

  // Calculate evening averages and update card
  if (eveningIndices.length > 0) {
    const eveningRealTemps = eveningIndices.map(
      (i) => data.hourly.temperature_2m[i]
    );
    const eveningFeelsLikeTemps = eveningIndices.map(
      (i) =>
        data.hourly.apparent_temperature[i] ||
        data.hourly.temperature_2m[i]
    );
    const eveningAvgTemp =
      eveningRealTemps.reduce((a, b) => a + b, 0) / eveningRealTemps.length;
    const eveningAvgFeelsLike =
      eveningFeelsLikeTemps.reduce((a, b) => a + b, 0) / eveningFeelsLikeTemps.length;
    const eveningWeatherCode =
      data.hourly.weathercode[
        eveningIndices[Math.floor(eveningIndices.length / 2)]
      ];
    const eveningPrecipitation = Math.max(
      ...eveningIndices.map((i) => data.hourly.precipitation[i] || 0)
    );
    const eveningWind = Math.max(
      ...eveningIndices.map((i) => data.hourly.windspeed_10m[i] || 0)
    );
    const eveningWeather = getWeatherInfo(eveningWeatherCode);

    // Update evening card
    const eveningTempEl = document.querySelector(
      ".evening-card .period-temp-value"
    );
    if (eveningTempEl) {
      eveningTempEl.textContent = Math.round(eveningAvgTemp);
    }

    // Update evening feels-like
    const eveningFeelsLikeEl = document.querySelector(".evening-feels-like");
    if (eveningFeelsLikeEl) {
      eveningFeelsLikeEl.textContent = `${Math.round(eveningAvgFeelsLike)}°C`;
    }

    const eveningIconEl = document.querySelector(".evening-card .period-weather-icon");
    if (eveningIconEl) {
      eveningIconEl.setAttribute("data-lucide", eveningWeather.icon);
    }

    const eveningTextEl = document.querySelector(
      ".evening-card .period-weather-text"
    );
    if (eveningTextEl) {
      eveningTextEl.textContent = eveningWeather.text;
    }

    // Update evening precipitation and wind
    const eveningPrecipEl = document.querySelector(".evening-precipitation");
    const eveningPrecipBox = document.querySelector(".evening-precipitation-box");
    if (eveningPrecipEl) {
      eveningPrecipEl.textContent = `${eveningPrecipitation.toFixed(1)} mm`;
      // Hide precipitation if it's 0.0
      if (eveningPrecipBox && eveningPrecipitation === 0) {
        eveningPrecipBox.classList.add("hidden");
      } else if (eveningPrecipBox) {
        eveningPrecipBox.classList.remove("hidden");
      }
    }

    const eveningWindEl = document.querySelector(".evening-wind");
    if (eveningWindEl) {
      eveningWindEl.textContent = `${Math.round(eveningWind)} km/h`;
    }

    // Get and display evening clothing recommendations
    const eveningClothes = getClothingRecommendations(
      eveningAvgTemp,
      eveningWeatherCode,
      eveningPrecipitation,
      eveningWind
    );
    const eveningClothingList = document.querySelector(
      ".evening-card .clothing-list"
    );
    if (eveningClothingList) {
      eveningClothingList.innerHTML = eveningClothes
        .map((item) => {
          if (item.icon) {
            return `<div class="clothing-item">
              <img src="/meteo/icons/${item.icon}" alt="${item.text}" class="clothing-icon-img" />
              <span>${item.text}</span>
            </div>`;
          } else {
            return `<div class="clothing-item">${item.emoji} ${item.text}</div>`;
          }
        })
        .join("");
    }
  }

  // Generate and display smart tips
  if (morningIndices.length > 0 && afternoonIndices.length > 0) {
    const morningAvgTemp =
      morningIndices
        .map(
          (i) =>
            data.hourly.apparent_temperature[i] ||
            data.hourly.temperature_2m[i]
        )
        .reduce((a, b) => a + b, 0) / morningIndices.length;
    const afternoonAvgTemp =
      afternoonIndices
        .map(
          (i) =>
            data.hourly.apparent_temperature[i] ||
            data.hourly.temperature_2m[i]
        )
        .reduce((a, b) => a + b, 0) / afternoonIndices.length;
    const morningWeatherCode =
      data.hourly.weathercode[
        morningIndices[Math.floor(morningIndices.length / 2)]
      ];
    const afternoonWeatherCode =
      data.hourly.weathercode[
        afternoonIndices[Math.floor(afternoonIndices.length / 2)]
      ];
    const morningPrecipitation = Math.max(
      ...morningIndices.map((i) => data.hourly.precipitation[i] || 0)
    );
    const afternoonPrecipitation = Math.max(
      ...afternoonIndices.map((i) => data.hourly.precipitation[i] || 0)
    );

    // Calculate evening data for smart tips
    let eveningAvgTemp = null;
    let eveningWeatherCode = null;
    let eveningPrecipitation = null;
    if (eveningIndices.length > 0) {
      eveningAvgTemp =
        eveningIndices
          .map(
            (i) =>
              data.hourly.apparent_temperature[i] ||
              data.hourly.temperature_2m[i]
          )
          .reduce((a, b) => a + b, 0) / eveningIndices.length;
      eveningWeatherCode =
        data.hourly.weathercode[
          eveningIndices[Math.floor(eveningIndices.length / 2)]
        ];
      eveningPrecipitation = Math.max(
        ...eveningIndices.map((i) => data.hourly.precipitation[i] || 0)
      );
    }

    const maxWind = Math.max(
      ...morningIndices.map((i) => data.hourly.windspeed_10m[i] || 0),
      ...afternoonIndices.map((i) => data.hourly.windspeed_10m[i] || 0),
      ...(eveningIndices.length > 0 ? eveningIndices.map((i) => data.hourly.windspeed_10m[i] || 0) : [0])
    );

    const smartTips = generateSmartTips(
      morningAvgTemp,
      morningWeatherCode,
      morningPrecipitation,
      afternoonAvgTemp,
      afternoonWeatherCode,
      afternoonPrecipitation,
      eveningAvgTemp,
      eveningWeatherCode,
      eveningPrecipitation,
      maxWind
    );

    // Display smart tips
    if (smartTips.length > 0) {
      const tipsList = document.querySelector(".tips-list");
      if (tipsList) {
        tipsList.innerHTML = smartTips
          .map((tip) => `<div class="tip-item">${tip}</div>`)
          .join("");

        const smartTipsEl = document.getElementById("smart-tips");
        if (smartTipsEl) {
          smartTipsEl.classList.remove("hidden");
        }
      }
    }
  }

  // Add temperature trends and period status
  const currentHour = now.getHours();

  // Helper function to get time difference in hours
  function getHoursUntil(targetHour) {
    let diff = targetHour - currentHour;
    if (diff < 0) diff += 24;
    return diff;
  }

  // Helper function to get period status text
  function getPeriodStatus(startHour, endHour) {
    if (currentHour >= startHour && currentHour < endHour) {
      return ""; // Don't show "Maintenant", just highlight the card
    } else if (currentHour < startHour) {
      const hoursUntil = getHoursUntil(startHour);
      if (hoursUntil === 1) {
        return "Dans 1h";
      } else if (hoursUntil < 8) {
        return `Dans ${hoursUntil}h`;
      }
    } else {
      return "";
    }
    return "";
  }

  // Update period statuses and highlight active period
  const morningCard = document.querySelector(".morning-card");
  const morningStatusEl = document.querySelector(".morning-status");
  const afternoonCard = document.querySelector(".afternoon-card");
  const afternoonStatusEl = document.querySelector(".afternoon-status");
  const eveningCard = document.querySelector(".evening-card");
  const eveningStatusEl = document.querySelector(".evening-status");

  if (morningCard && morningStatusEl) {
    const status = getPeriodStatus(8, 12);
    morningStatusEl.textContent = status;
    // Check if current hour is within this period
    if (currentHour >= 8 && currentHour < 12) {
      morningCard.classList.add("active");
    } else {
      morningCard.classList.remove("active");
    }
  }

  if (afternoonCard && afternoonStatusEl) {
    const status = getPeriodStatus(12, 18);
    afternoonStatusEl.textContent = status;
    // Check if current hour is within this period
    if (currentHour >= 12 && currentHour < 18) {
      afternoonCard.classList.add("active");
    } else {
      afternoonCard.classList.remove("active");
    }
  }

  if (eveningCard && eveningStatusEl) {
    const status = getPeriodStatus(18, 21);
    eveningStatusEl.textContent = status;
    // Check if current hour is within this period
    if (currentHour >= 18 && currentHour < 21) {
      eveningCard.classList.add("active");
    } else {
      eveningCard.classList.remove("active");
    }
  }

  // Show the section
  const todayForecastEl = document.getElementById("today-forecast");
  if (todayForecastEl) {
    todayForecastEl.classList.remove("hidden");
  }

  // Refresh Lucide icons
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

/**
 * Update 5-day forecast display with enriched data
 * Shows 5 future days (excludes today)
 * @param {Object} data - Weather API data
 */
export function updateFiveDayForecast(data) {
  const forecastGrid = document.querySelector(".forecast-grid");
  if (!forecastGrid) return;

  forecastGrid.innerHTML = "";

  // Find today's date index (use local date, not UTC)
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const todayDate = `${year}-${month}-${day}`;
  let todayIndex = data.daily.time.findIndex(date => date === todayDate);

  // If today is not found, default to index 0
  if (todayIndex === -1) {
    todayIndex = 0;
  }

  // Start from tomorrow (day after today's index) and show 4 future days
  const startIndex = todayIndex + 1;
  const daysToShow = 4;

  // Find warmest, coldest, and rainiest days among the 4 future days
  const futureDays = data.daily.time.slice(startIndex, startIndex + daysToShow);
  let warmestDay = startIndex;
  let coldestDay = startIndex;
  let rainiestDay = startIndex;
  let maxTemp = data.daily.temperature_2m_max[startIndex];
  let minTemp = data.daily.temperature_2m_max[startIndex];
  let maxRain = data.daily.precipitation_sum[startIndex] || 0;

  for (let i = startIndex; i < startIndex + daysToShow && i < data.daily.time.length; i++) {
    const temp = data.daily.temperature_2m_max[i];
    const rain = data.daily.precipitation_sum[i] || 0;

    if (temp > maxTemp) {
      maxTemp = temp;
      warmestDay = i;
    }
    if (temp < minTemp) {
      minTemp = temp;
      coldestDay = i;
    }
    if (rain > maxRain) {
      maxRain = rain;
      rainiestDay = i;
    }
  }

  for (let i = startIndex; i < startIndex + daysToShow && i < data.daily.time.length; i++) {
    const weatherInfo = getWeatherInfo(data.daily.weathercode[i]);
    const tempMax = Math.round(data.daily.temperature_2m_max[i]);
    const tempMin = Math.round(data.daily.temperature_2m_min[i]);
    const precipitation = data.daily.precipitation_sum[i] || 0;

    // Format date (ex: "Lun 14/10")
    // Parse date string manually to avoid timezone issues
    const [year, month, day] = data.daily.time[i].split('-').map(Number);
    const shortDate = `${day}/${month}`;

    // Determine day name
    const dayName = getShortDayName(data.daily.time[i]);
    const isToday = dayName === "Aujourd'hui";

    // Calculate temperature range for subtle color coding
    let tempRange = "mild"; // default
    if (tempMax < 5) {
      tempRange = "very-cold";
    } else if (tempMax < 10) {
      tempRange = "cold";
    } else if (tempMax >= 15 && tempMax < 20) {
      tempRange = "warm";
    } else if (tempMax >= 20) {
      tempRange = "hot";
    }

    // Calculate max wind from hourly data for this day
    let maxWind = 0;
    if (data.hourly && data.hourly.windspeed_10m) {
      const dayStart = data.daily.time[i];
      const dayIndices = data.hourly.time
        .map((time, idx) => time.startsWith(dayStart) ? idx : -1)
        .filter(idx => idx !== -1);

      if (dayIndices.length > 0) {
        maxWind = Math.max(...dayIndices.map(idx => data.hourly.windspeed_10m[idx] || 0));
      }
    }
    maxWind = Math.round(maxWind);

    // Generate badges
    const badges = [];
    if (precipitation > 2) {
      badges.push('<span class="badge badge-rain"><i data-lucide="cloud-rain" class="badge-icon"></i>Pluie</span>');
    }
    if (maxWind > 20) {
      badges.push('<span class="badge badge-wind"><i data-lucide="wind" class="badge-icon"></i>Venteux</span>');
    }
    if (tempMax > 28) {
      badges.push('<span class="badge badge-hot"><i data-lucide="thermometer-sun" class="badge-icon"></i>Chaud</span>');
    }
    if (tempMax < 5) {
      badges.push('<span class="badge badge-cold"><i data-lucide="snowflake" class="badge-icon"></i>Froid</span>');
    }
    // Add BEAU badge for nice sunny days
    const sunnyCodes = [0, 1]; // Clear or mainly clear
    if (sunnyCodes.includes(data.daily.weathercode[i]) && tempMax >= 18 && tempMax <= 25 && precipitation < 0.5) {
      badges.push('<span class="badge badge-sunny"><i data-lucide="sun" class="badge-icon"></i>Beau</span>');
    }

    const badgesHtml = badges.length > 0
      ? `<div class="forecast-badges">${badges.join('')}</div>`
      : '';

    const card = document.createElement("div");
    card.className = "forecast-card";
    card.setAttribute("data-temp", tempMax);
    card.setAttribute("data-temp-range", tempRange);

    // Add special indicators for warmest/coldest/rainiest days
    if (i === warmestDay && warmestDay !== coldestDay) {
      card.classList.add("warmest-day");
    }
    if (i === coldestDay && coldestDay !== warmestDay) {
      card.classList.add("coldest-day");
    }
    if (i === rainiestDay && maxRain > 1) { // Only highlight if it's actually rainy
      card.classList.add("rainiest-day");
    }

    card.innerHTML = `
      <div class="forecast-header">
        <span class="forecast-day-name">${dayName}</span>
        <span class="forecast-date">${shortDate}</span>
      </div>

      <div class="forecast-main">
        <i data-lucide="${weatherInfo.icon}" class="forecast-icon-large"></i>
        <div class="forecast-temps-large">
          <span class="temp-high">${tempMax}°</span>
          <span class="temp-separator">/</span>
          <span class="temp-low">${tempMin}°</span>
        </div>
      </div>

      <div class="forecast-description-text">${weatherInfo.text}</div>

      ${badgesHtml}

      <div class="forecast-details-grid">
        <div class="detail-mini">
          <i data-lucide="droplets" class="detail-mini-icon"></i>
          <span>${precipitation.toFixed(1)} mm</span>
        </div>
        <div class="detail-mini">
          <i data-lucide="wind" class="detail-mini-icon"></i>
          <span>${maxWind} km/h</span>
        </div>
      </div>
    `;

    forecastGrid.appendChild(card);
  }

  const forecastEl = document.getElementById("forecast");
  if (forecastEl) {
    forecastEl.classList.remove("hidden");
  }

  // Refresh Lucide icons
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// Helper function for getShortDayName (duplicated from utils for standalone use)
function getShortDayName(dateStr) {
  // Compare date strings directly to avoid timezone issues (use local date, not UTC)
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const todayStr = `${year}-${month}-${day}`;

  if (dateStr === todayStr) {
    return "Aujourd'hui";
  }

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowYear = tomorrow.getFullYear();
  const tomorrowMonth = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const tomorrowDay = String(tomorrow.getDate()).padStart(2, '0');
  const tomorrowStr = `${tomorrowYear}-${tomorrowMonth}-${tomorrowDay}`;

  if (dateStr === tomorrowStr) {
    return "Demain";
  }

  // For other days, return the day name
  // Parse the date string manually to avoid timezone issues
  const [dateYear, dateMonth, dateDay] = dateStr.split('-').map(Number);
  const date = new Date(dateYear, dateMonth - 1, dateDay); // month is 0-indexed in Date constructor
  const days = [
    "Dimanche",
    "Lundi",
    "Mardi",
    "Mercredi",
    "Jeudi",
    "Vendredi",
    "Samedi",
  ];
  return days[date.getDay()];
}

/**
 * Update hourly chart display with today's hourly data
 * @param {Object} data - Weather API data
 */
export function updateHourlyChart(data) {
  const chartWrapper = document.getElementById('hourly-chart-wrapper');
  const chartSection = document.getElementById('hourly-chart-section');

  if (!chartWrapper || !chartSection) return;

  if (!data.hourly || !data.hourly.time) {
    chartSection.classList.add('hidden');
    return;
  }

  const now = new Date();
  const todayDate = now.toISOString().split("T")[0];
  const currentHour = now.getHours();

  // Extract today's hourly data with enriched information
  const hourlyData = [];
  data.hourly.time.forEach((time, index) => {
    if (time.startsWith(todayDate)) {
      const timeObj = new Date(time);
      const hour = timeObj.getHours();

      hourlyData.push({
        hour: `${hour}h`,
        temp: Math.round(data.hourly.temperature_2m[index]),
        feelsLike: Math.round(data.hourly.apparent_temperature[index] || data.hourly.temperature_2m[index]),
        precipitation: parseFloat((data.hourly.precipitation[index] || 0).toFixed(1)),
        precipProb: data.hourly.precipitation_probability ? data.hourly.precipitation_probability[index] : undefined,
        windSpeed: data.hourly.windspeed_10m ? Math.round(data.hourly.windspeed_10m[index]) : undefined,
        humidity: data.hourly.relative_humidity_2m ? Math.round(data.hourly.relative_humidity_2m[index]) : undefined,
        weatherCode: data.hourly.weathercode ? data.hourly.weathercode[index] : undefined,
        isNow: hour === currentHour,
      });
    }
  });

  if (hourlyData.length === 0) {
    chartSection.classList.add('hidden');
    return;
  }

  // Get sunrise and sunset for today
  const sunrise = data.daily && data.daily.sunrise ? data.daily.sunrise[0] : undefined;
  const sunset = data.daily && data.daily.sunset ? data.daily.sunset[0] : undefined;

  // Clear previous chart and render new one
  chartWrapper.innerHTML = '';

  // Create React root and render the chart with all data
  const root = ReactDOM.createRoot(chartWrapper);
  root.render(React.createElement(HourlyChart, {
    data: hourlyData,
    sunrise: sunrise,
    sunset: sunset,
  }));

  // Show the section
  chartSection.classList.remove('hidden');
}

/**
 * Update 10-day compact forecast display with temperature range visualization
 * Shows 10 future days (excludes today)
 * @param {Object} data - Weather API data
 */
export function updateTenDayForecast(data) {
  const tenDayList = document.querySelector(".ten-day-list");
  if (!tenDayList) return;

  tenDayList.innerHTML = "";

  // Find today's date index (use local date, not UTC)
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const todayDate = `${year}-${month}-${day}`;

  let todayIndex = data.daily.time.findIndex(date => date === todayDate);

  // If today is not found, default to index 0
  if (todayIndex === -1) {
    todayIndex = 0;
  }

  // Start from tomorrow (day after today's index) and show 10 future days
  const startIndex = todayIndex + 1;
  const daysToShow = 10;

  // Calculate global min/max temperatures for the 10-day range
  let globalMin = Infinity;
  let globalMax = -Infinity;

  for (let i = startIndex; i < startIndex + daysToShow && i < data.daily.time.length; i++) {
    const tempMin = data.daily.temperature_2m_min[i];
    const tempMax = data.daily.temperature_2m_max[i];
    if (tempMin < globalMin) globalMin = tempMin;
    if (tempMax > globalMax) globalMax = tempMax;
  }

  // Add some padding to the range for better visualization
  const tempRange = globalMax - globalMin;
  const padding = tempRange * 0.1;
  globalMin = globalMin - padding;
  globalMax = globalMax + padding;
  const totalRange = globalMax - globalMin;

  for (let i = startIndex; i < startIndex + daysToShow && i < data.daily.time.length; i++) {
    const weatherInfo = getWeatherInfo(data.daily.weathercode[i]);
    const tempMax = Math.round(data.daily.temperature_2m_max[i]);
    const tempMin = Math.round(data.daily.temperature_2m_min[i]);
    const precipitation = data.daily.precipitation_sum[i] || 0;

    // Get precipitation probability if available
    const precipProb = data.daily.precipitation_probability_max ?
      data.daily.precipitation_probability_max[i] : null;

    // Determine day name
    const dayName = getShortDayName(data.daily.time[i]);

    // Calculate temperature bar position and width
    const minPos = ((data.daily.temperature_2m_min[i] - globalMin) / totalRange) * 100;
    const maxPos = ((data.daily.temperature_2m_max[i] - globalMin) / totalRange) * 100;
    const barWidth = maxPos - minPos;

    const row = document.createElement("div");
    row.className = "ten-day-row";

    // Only show precipitation if probability is significant (> 20%) or if there's precipitation
    const showPrecip = (precipProb !== null && precipProb > 20) || precipitation > 0.5;
    const precipDisplay = precipProb !== null && precipProb > 0
      ? `<i data-lucide="cloud-rain" class="ten-day-precip-icon"></i><span>${precipProb}%</span>`
      : '';

    row.innerHTML = `
      <span class="ten-day-day-name">${dayName}</span>
      <i data-lucide="${weatherInfo.icon}" class="ten-day-icon"></i>
      <span class="ten-day-temp-low">${tempMin}°</span>
      <div class="ten-day-temp-bar-container">
        <div class="ten-day-temp-bar" style="left: ${minPos}%; width: ${barWidth}%;"></div>
      </div>
      <span class="ten-day-temp-high">${tempMax}°</span>
      <div class="ten-day-precip">
        ${showPrecip ? precipDisplay : ''}
      </div>
    `;

    tenDayList.appendChild(row);
  }

  const tenDayEl = document.getElementById("ten-day-forecast");
  if (tenDayEl) {
    tenDayEl.classList.remove("hidden");
  }

  // Refresh Lucide icons
  if (window.lucide) {
    window.lucide.createIcons();
  }
}
