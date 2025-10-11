/**
 * Shopping List Manager
 * Manages localStorage for shopping list feature
 */

const STORAGE_KEY = 'renard-shopping-list';

/**
 * Get the current shopping list from localStorage
 * @returns {Array} Array of ingredient objects
 */
export function getShoppingList() {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading shopping list:', error);
    return [];
  }
}

/**
 * Save shopping list to localStorage
 * @param {Array} shoppingList - Array of ingredient objects
 */
function saveShoppingList(shoppingList) {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(shoppingList));
    // Dispatch event to sync UI across components
    window.dispatchEvent(new CustomEvent('shoppingListUpdated', {
      detail: { shoppingList }
    }));
  } catch (error) {
    console.error('Error saving shopping list:', error);
  }
}

/**
 * Generate a unique ID for an ingredient entry
 * @returns {string} Unique ID
 */
function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Add an ingredient to the shopping list
 * @param {string} recipeId - Recipe ID
 * @param {string} recipeName - Recipe name
 * @param {number} ingredientIndex - Index of ingredient in recipe
 * @param {object} ingredientData - Ingredient data (quantity, unit, ingredient, note)
 * @returns {boolean} Success status
 */
export function addIngredient(recipeId, recipeName, ingredientIndex, ingredientData) {
  const shoppingList = getShoppingList();

  // Check if this ingredient is already in the list
  const exists = shoppingList.some(
    item => item.recipeId === recipeId && item.ingredientIndex === ingredientIndex
  );

  if (exists) {
    return false;
  }

  const newItem = {
    id: generateId(),
    recipeId,
    recipeName,
    ingredientIndex,
    quantity: ingredientData.quantity,
    unit: ingredientData.unit,
    ingredient: ingredientData.ingredient,
    note: ingredientData.note,
    checked: false
  };

  shoppingList.push(newItem);
  saveShoppingList(shoppingList);
  return true;
}

/**
 * Remove an ingredient from the shopping list
 * @param {string} id - Unique ingredient ID
 * @returns {boolean} Success status
 */
export function removeIngredient(id) {
  const shoppingList = getShoppingList();
  const filtered = shoppingList.filter(item => item.id !== id);

  if (filtered.length === shoppingList.length) {
    return false; // Item not found
  }

  saveShoppingList(filtered);
  return true;
}

/**
 * Toggle the checked status of an ingredient
 * @param {string} id - Unique ingredient ID
 * @returns {boolean} Success status
 */
export function toggleChecked(id) {
  const shoppingList = getShoppingList();
  const item = shoppingList.find(item => item.id === id);

  if (!item) {
    return false;
  }

  item.checked = !item.checked;
  saveShoppingList(shoppingList);
  return true;
}

/**
 * Check if a specific ingredient is in the shopping list
 * @param {string} recipeId - Recipe ID
 * @param {number} ingredientIndex - Index of ingredient in recipe
 * @returns {boolean}
 */
export function isInShoppingList(recipeId, ingredientIndex) {
  const shoppingList = getShoppingList();
  return shoppingList.some(
    item => item.recipeId === recipeId && item.ingredientIndex === ingredientIndex
  );
}

/**
 * Remove all checked items from the shopping list
 * @returns {number} Number of items removed
 */
export function removeCheckedItems() {
  const shoppingList = getShoppingList();
  const unchecked = shoppingList.filter(item => !item.checked);
  const removedCount = shoppingList.length - unchecked.length;

  saveShoppingList(unchecked);
  return removedCount;
}

/**
 * Clear the entire shopping list
 */
export function clearShoppingList() {
  saveShoppingList([]);
}
