/**
 * Utility for auto-transliterating English text to Marathi (Devanagari script)
 * Uses Google Input Tools free transliteration endpoint (No API key needed).
 * Includes memory & localStorage caching to avoid redundant network requests.
 */

const LOCAL_STORAGE_KEY = 'marathi_transliteration_cache_v1';

const getCacheFromStorage = () => {
  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    return cached ? JSON.parse(cached) : {};
  } catch (e) {
    return {};
  }
};

const saveCacheToStorage = (cacheObj) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cacheObj));
  } catch (e) {
    // Ignore storage quota errors
  }
};

const memoryCache = new Map(Object.entries(getCacheFromStorage()));

/**
 * Transliterates English text to Marathi Devanagari script.
 * e.g., "Mahakal Traders" -> "महाकाल ट्रेडर्स"
 * @param {string} text 
 * @returns {Promise<string>} Marathi transliterated text
 */
export const transliterateToMarathi = async (text) => {
  if (!text || typeof text !== 'string' || !text.trim() || text === '-') {
    return text || '';
  }

  const trimmed = text.trim();

  // If text already contains Devanagari characters (Marathi/Hindi), return directly
  if (/[\u0900-\u097F]/.test(trimmed)) {
    return trimmed;
  }

  // Check cache first
  if (memoryCache.has(trimmed)) {
    return memoryCache.get(trimmed);
  }

  try {
    const url = `https://inputtools.google.com/request?text=${encodeURIComponent(trimmed)}&itc=mr-t-i0-und&num=1`;
    const response = await fetch(url);
    const data = await response.json();

    if (data && data[0] === 'SUCCESS' && data[1] && data[1].length > 0) {
      // Extract transliterated words from response structure
      // Format: ["SUCCESS", [ ["word1", ["मराठी1"]], ["word2", ["मराठी2"]] ]]
      const convertedWords = data[1].map((item) => {
        if (item && item[1] && item[1].length > 0) {
          return item[1][0];
        }
        return item[0];
      });

      const result = convertedWords.join(' ');

      // Save in cache
      memoryCache.set(trimmed, result);
      const cacheObject = Object.fromEntries(memoryCache.entries());
      saveCacheToStorage(cacheObject);

      return result;
    }
  } catch (error) {
    console.warn('Marathi transliteration network request failed:', error);
  }

  // Fallback to original text on network error or missing match
  return trimmed;
};
