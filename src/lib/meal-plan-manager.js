/**
 * Meal Plan Manager
 * Manages localStorage for meal planning feature
 */

const STORAGE_KEY = 'renard-meal-plan';

/**
 * Get the current meal plan from localStorage
 * @returns {string[]} Array of recipe IDs
 */
export function getMealPlan() {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading meal plan:', error);
    return [];
  }
}

/**
 * Save meal plan to localStorage
 * @param {string[]} mealPlan - Array of recipe IDs
 */
function saveMealPlan(mealPlan) {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mealPlan));
    // Dispatch event to sync UI across components
    window.dispatchEvent(new CustomEvent('mealPlanUpdated', {
      detail: { mealPlan }
    }));
  } catch (error) {
    console.error('Error saving meal plan:', error);
  }
}

/**
 * Add a recipe to the meal plan
 * @param {string} recipeId - Recipe ID to add
 * @returns {boolean} Success status
 */
export function addRecipe(recipeId) {
  const mealPlan = getMealPlan();

  // Don't add duplicates
  if (mealPlan.includes(recipeId)) {
    return false;
  }

  mealPlan.push(recipeId);
  saveMealPlan(mealPlan);
  return true;
}

/**
 * Remove a recipe from the meal plan
 * @param {string} recipeId - Recipe ID to remove
 * @returns {boolean} Success status
 */
export function removeRecipe(recipeId) {
  const mealPlan = getMealPlan();
  const filtered = mealPlan.filter(id => id !== recipeId);

  if (filtered.length === mealPlan.length) {
    return false; // Recipe not found
  }

  saveMealPlan(filtered);
  return true;
}

/**
 * Check if a recipe is in the meal plan
 * @param {string} recipeId - Recipe ID to check
 * @returns {boolean}
 */
export function isInMealPlan(recipeId) {
  return getMealPlan().includes(recipeId);
}

/**
 * Move a recipe up or down in the meal plan
 * @param {number} currentIndex - Current index of the recipe
 * @param {number} newIndex - New index for the recipe
 */
export function reorderMeal(currentIndex, newIndex) {
  const mealPlan = getMealPlan();

  // Validate indices
  if (currentIndex < 0 || currentIndex >= mealPlan.length ||
      newIndex < 0 || newIndex >= mealPlan.length) {
    return;
  }

  // Swap items
  const [removed] = mealPlan.splice(currentIndex, 1);
  mealPlan.splice(newIndex, 0, removed);

  saveMealPlan(mealPlan);
}

/**
 * Clear the entire meal plan
 */
export function clearMealPlan() {
  saveMealPlan([]);
}
