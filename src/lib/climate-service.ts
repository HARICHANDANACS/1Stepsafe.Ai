import type { ClimateData } from './data';
import axios from 'axios';

// A simple in-memory cache to store API responses to avoid redundant calls.
const cache = new Map<string, any>();

const getApiKey = () => {
    const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
    if (!apiKey) {
        throw new Error("OpenWeather API key is not configured. Please set NEXT_PUBLIC_OPENWEATHER_API_KEY in your environment.");
    }
    return apiKey;
}

// Function to get Air Quality Index (AQI)
const getAqi = async (lat: number, lon: number, apiKey: string): Promise<number> => {
    const cacheKey = `aqi-${lat}-${lon}`;
    if (cache.has(cacheKey)) return cache.get(cacheKey);

    const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;
    try {
        const response = await axios.get(url);
        const aqi = response.data.list[0].main.aqi; // AQI is a value from 1 to 5. We can scale it if needed.
        // For simplicity, we'll map it to the 0-500 scale. (1=Good, 5=Very Poor)
        const scaledAqi = [50, 100, 150, 200, 300][aqi - 1] || 50; 
        cache.set(cacheKey, scaledAqi);
        return scaledAqi;
    } catch (error) {
        console.error("Failed to fetch AQI data:", error);
        return 50; // Return a default low-risk value on error
    }
}

/**
 * Fetches real-time climate data for a given location using OpenWeatherMap API.
 */
export async function getClimateDataForCity(lat: number, lon: number): Promise<ClimateData> {
    const apiKey = getApiKey();
    const cacheKey = `current-${lat}-${lon}`;
    if (cache.has(cacheKey)) return cache.get(cacheKey);

    const weatherUrl = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,daily,alerts&units=imperial&appid=${apiKey}`;
    
    try {
        const weatherResponse = await axios.get(weatherUrl);
        const data = weatherResponse.data.current;

        const aqi = await getAqi(lat, lon, apiKey);

        const climateData: ClimateData = {
            temperature: Math.round(data.temp),
            humidity: data.humidity,
            uvIndex: Math.round(data.uvi),
            aqi: aqi,
            rainProbability: data.rain ? (data.rain['1h'] || 0) * 100 : 0, // A simplification
        };
        
        cache.set(cacheKey, climateData);
        return climateData;

    } catch (error) {
        console.error("Failed to fetch current weather data:", error);
        // Fallback to deterministic mock data in case of API failure
        return generateDeterministicMockData(lat + lon);
    }
}

/**
 * Fetches historical climate data for a given location for "yesterday".
 */
export async function getYesterdayClimateData(lat: number, lon: number): Promise<ClimateData> {
    const apiKey = getApiKey();
    const yesterdayTimestamp = Math.floor((Date.now() - 24 * 60 * 60 * 1000) / 1000);
    
    const cacheKey = `yesterday-${lat}-${lon}`;
    if (cache.has(cacheKey)) return cache.get(cacheKey);

    const url = `https://api.openweathermap.org/data/3.0/onecall/timemachine?lat=${lat}&lon=${lon}&dt=${yesterdayTimestamp}&units=imperial&appid=${apiKey}`;

    try {
        const response = await axios.get(url);
        const data = response.data.data[0];

        // Historical AQI is not straightforward, so we'll use a placeholder or assume it's similar to today's
        const aqi = await getAqi(lat, lon, apiKey);

         const climateData: ClimateData = {
            temperature: Math.round(data.temp),
            humidity: data.humidity,
            uvIndex: Math.round(data.uvi),
            aqi: aqi,
            rainProbability: data.rain ? (data.rain['1h'] || 0) * 100 : 0,
        };

        cache.set(cacheKey, climateData);
        return climateData;

    } catch (error) {
        console.error("Failed to fetch yesterday's weather data:", error);
        // Fallback to deterministic mock data in case of API failure
        return generateDeterministicMockData(lat + lon - 1);
    }
}


// Fallback mock data generator
const createDeterministicRandom = (seed: number) => {
    let state = seed;
    return () => {
        const x = Math.sin(state++) * 10000;
        return x - Math.floor(x);
    };
}

const generateDeterministicMockData = (seed: number): ClimateData => {
  const random = createDeterministicRandom(seed);
  return {
    temperature: Math.round(65 + (random() * 50 - 15)),
    humidity: Math.max(0, Math.min(100, Math.round(50 + (random() * 70 - 30)))),
    uvIndex: Math.floor(random() * 12),
    aqi: Math.floor(10 + random() * 240),
    rainProbability: Math.floor(random() * 101),
  };
}
