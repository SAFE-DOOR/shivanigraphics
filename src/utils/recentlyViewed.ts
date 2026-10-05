// Utility for managing recently viewed products in localStorage

export const RECENTLY_VIEWED_KEY = 'shivani_recently_viewed';

// Default initial 4 products if the user hasn't browsed yet
export const DEFAULT_RECENT_IDS = [
  'visiting-cards-premium',
  'pvc-aadhaar-smart-card',
  'round-neck-tshirt',
  'self-inking-stamps'
];

/**
 * Retrieves the last 4 clicked product IDs from localStorage
 */
export const getRecentlyViewedIds = (): string[] => {
  if (typeof window === 'undefined') return DEFAULT_RECENT_IDS;
  try {
    const raw = localStorage.getItem(RECENTLY_VIEWED_KEY);
    if (!raw) return DEFAULT_RECENT_IDS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.slice(0, 4);
    }
    return DEFAULT_RECENT_IDS;
  } catch (e) {
    return DEFAULT_RECENT_IDS;
  }
};

/**
 * Adds a product ID to the front of the recently viewed list, maintaining max 4 items
 */
export const addRecentlyViewedId = (productId: string): void => {
  if (typeof window === 'undefined' || !productId) return;
  try {
    const raw = localStorage.getItem(RECENTLY_VIEWED_KEY);
    let list: string[] = [];
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        list = parsed;
      }
    } else {
      list = [...DEFAULT_RECENT_IDS];
    }

    // Filter out current id, prepend to front, cap at 4
    const updated = [productId, ...list.filter(id => id !== productId)].slice(0, 4);
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(updated));

    // Dispatch a custom window event so open components (like the home feed) can sync instantly
    window.dispatchEvent(new CustomEvent('recently-viewed-updated', { detail: updated }));
  } catch (e) {
    console.warn('Could not save to recently viewed', e);
  }
};
