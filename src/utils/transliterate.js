/**
 * Utility for auto-transliterating English text to Marathi (Devanagari script)
 * Uses Google Input Tools free transliteration endpoint (No API key needed) with
 * smart phonetic candidate selection and common Marathi proper noun/business dictionary.
 * Includes memory & localStorage caching to avoid redundant network requests.
 */

const LOCAL_STORAGE_KEY = 'marathi_transliteration_cache_v2';

// Dictionary of common Marathi terms & proper names for 100% accurate conversion
const MARATHI_DICTIONARY = {
  // Common Proper Names
  varad: 'वरद',
  sharad: 'शरद',
  prasad: 'प्रसाद',
  pramod: 'प्रमोद',
  vinod: 'विनोद',
  anand: 'आनंद',
  karan: 'करण',
  pawan: 'पवन',
  chetan: 'चेतन',
  rohan: 'रोहन',
  sachin: 'सचिन',
  rahul: 'राहुल',
  nitin: 'नितीन',
  dinesh: 'दिनेश',
  mahesh: 'महेश',
  suresh: 'सुरेश',
  ramesh: 'रमेश',
  ganesh: 'गणेश',
  akash: 'आकाश',
  vikas: 'विकास',
  amar: 'अमर',
  vijay: 'विजय',
  ajay: 'अजय',
  sanjay: 'संजय',
  sunil: 'सुनील',
  anil: 'अनिल',
  pravin: 'प्रवीण',
  prashant: 'प्रशांत',
  omkar: 'ओमकार',
  aditya: 'आदित्य',
  suraj: 'सूरज',
  shubham: 'शुभम',
  swapnil: 'स्वप्निल',

  // Business & Shop terms
  super: 'सुपर',
  market: 'मार्केट',
  trader: 'ट्रेडर',
  traders: 'ट्रेडर्स',
  store: 'स्टोअर',
  stores: 'स्टोअर्स',
  kirana: 'किराणा',
  general: 'जनरल',
  enterprise: 'एन्टरप्राइज',
  enterprises: 'एन्टरप्रायजेस',
  agency: 'एजन्सी',
  agencies: 'एजन्सीज',
  company: 'कंपनी',
  transport: 'ट्रांसपोर्ट',
  express: 'एक्सप्रेस',
  logistics: 'लॉजिस्टिक्स',
  center: 'सेंटर',
  centre: 'सेंटर',
  bhavan: 'भवन',
  bhawan: 'भवन',
  mart: 'मार्ट',
  hub: 'हब',
  services: 'सर्व्हिसेस',
  service: 'सर्व्हिस',
  road: 'रोड',
  nagar: 'नगर',
  chowk: 'चौक',
  galli: 'गल्ली',
  plot: 'प्लॉट',
  shop: 'शॉप',
};

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
 * Transliterates single word to Marathi using dictionary or smart candidate selection
 */
const transliterateWord = (word, candidates = []) => {
  const clean = word.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (MARATHI_DICTIONARY[clean]) {
    return MARATHI_DICTIONARY[clean];
  }

  if (candidates && candidates.length > 0) {
    // If English word ends in 'ad' (e.g. Varad, Sharad, Prasad), prefer candidate ending in 'द' over 'ाड'
    if (clean.endsWith('ad')) {
      const match = candidates.find((c) => c.endsWith('द'));
      if (match) return match;
    }
    return candidates[0];
  }

  return word;
};

/**
 * Transliterates English text to Marathi Devanagari script.
 * e.g., "Varad Super market" -> "वरद सुपर मार्केट"
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
    const url = `https://inputtools.google.com/request?text=${encodeURIComponent(trimmed)}&itc=mr-t-i0-und&num=5`;
    const response = await fetch(url);
    const data = await response.json();

    if (data && data[0] === 'SUCCESS' && data[1] && data[1].length > 0) {
      // Extract transliterated words from response structure with candidate selection
      // Format: ["SUCCESS", [ ["word1", ["मराठी1_a", "मराठी1_b"]], ... ]]
      const convertedWords = data[1].map((item) => {
        const origWord = item[0] || '';
        const candidates = item[1] || [];
        return transliterateWord(origWord, candidates);
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

  // Fallback: check dictionary word by word if network failed
  const fallbackWords = trimmed.split(/\s+/).map((w) => {
    const clean = w.toLowerCase().replace(/[^a-z0-9]/g, '');
    return MARATHI_DICTIONARY[clean] || w;
  });

  return fallbackWords.join(' ');
};

