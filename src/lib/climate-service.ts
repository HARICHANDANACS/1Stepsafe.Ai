
import type { ClimateData } from './data';

// A simple in-memory cache to store API responses to avoid redundant calls.
const cache = new Map<string, any>();

// Fallback mock data generator
const createDeterministicRandom = (seed: number) => {
    let state = seed;
    return () => {
        const x = Math.sin(state++) * 10000;
        return x - Math.floor(x);
    };
}

const generateDeterministicMockData = (seed: number): Omit<ClimateData, 'aqi'> => {
  const random = createDeterministicRandom(seed);
  return {
    temperature: Math.round(65 + (random() * 25)), // More realistic temp range
    humidity: Math.max(20, Math.min(80, Math.round(50 + (random() * 50 - 25)))),
    uvIndex: Math.floor(random() * 11),
    rainProbability: Math.floor(random() * 40), // Lower chance of rain
  };
}


/**
 * Fetches real-time climate data. It uses Google's Air Quality API for live AQI
 * and a deterministic mock generator for other weather parameters to ensure stability.
 */
export async function getClimateDataForCity(lat: number, lon: number): Promise<ClimateData> {
    const cacheKey = `current-${lat}-${lon}`;
    if (cache.has(cacheKey)) return cache.get(cacheKey);

    let aqi = 50; // Default AQI
    
    try {
        // Use Google's free Air Quality API.
        const aqiResponse = await fetch('https://airquality.googleapis.com/v1/currentConditions:lookup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                location: { latitude: lat, longitude: lon }
            }),
        });

        if (aqiResponse.ok) {
            const aqiData = await aqiResponse.json();
            aqi = aqiData?.indexes?.[0]?.aqi || 50;
        } else {
            // Log the error but don't throw, so we can fall back to mock data.
            console.error(`Google Air Quality API failed with status ${aqiResponse.status}`);
        }
    } catch (error) {
        console.error("Failed to fetch climate data:", error);
    }

    // Generate stable, deterministic mock data for other parameters
    const otherData = generateDeterministicMockData(lat + lon);

    const climateData: ClimateData = {
        ...otherData,
        aqi: aqi,
    };
    
    cache.set(cacheKey, climateData);
    return climateData;
}

/**
 * Fetches historical climate data for "yesterday".
 * Uses a deterministic mock generator for stability.
 */
export async function getYesterdayClimateData(lat: number, lon: number): Promise<ClimateData> {
    const cacheKey = `yesterday-${lat}-${lon}`;
    if (cache.has(cacheKey)) return cache.get(cacheKey);
    
    // For stability and to avoid complex API calls, we use deterministic mock data for yesterday.
    const mockSeed = lat + lon - 1; // Different seed for a different day
    const random = createDeterministicRandom(mockSeed);
    const climateData: ClimateData = {
        ...generateDeterministicMockData(mockSeed),
        aqi: Math.floor(10 + random() * 150)
    };

    cache.set(cacheKey, climateData);
    return climateData;
}
