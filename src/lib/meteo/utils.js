/**
 * Meteo Utility Functions
 * Date formatting and translation helpers
 */

/**
 * Format day of week in French
 * @param {string} dateStr - ISO date string
 * @returns {string} Full day name in French
 */
export function getDayName(dateStr) {
  const date = new Date(dateStr);
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
 * Get short day name with relative labels
 * @param {string} dateStr - ISO date string
 * @returns {string} "Aujourd'hui", "Demain", or day name
 */
export function getShortDayName(dateStr) {
  const date = new Date(dateStr);
  const today = new Date();

  if (date.toDateString() === today.toDateString()) {
    return "Aujourd'hui";
  }

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (date.toDateString() === tomorrow.toDateString()) {
    return "Demain";
  }

  return getDayName(dateStr);
}

/**
 * Format time from ISO string
 * @param {string} timeStr - ISO datetime string
 * @returns {string} Formatted time (HH:MM)
 */
export function formatTime(timeStr) {
  const date = new Date(timeStr);
  return date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
