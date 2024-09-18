const DEFAULT_EXPIRATION = 60000 * 60;

export const loadFromStorage = (storage, cacheKey, expiration, now) => {
  const cachedData = storage.getItem(cacheKey);
  if (!cachedData) {
    return;
  }

  const parsedData = JSON.parse(cachedData);

  const expiryTime = expiration ?? DEFAULT_EXPIRATION;
  const currentTime = now ?? Date.now();

  if (currentTime - parsedData.timestamp >= expiryTime) {
    console.log("Cache expired for:", cacheKey);
    localStorage.removeItem(cacheKey);
    return;
  }

  console.log("Returning cached data from localStorage");
  return parsedData.data;
};

export const setToStorage = (storage, key, data, now) => {
  const timestamp = now ?? Date.now();
  storage.setItem(key, JSON.stringify({ data, timestamp }));
};
