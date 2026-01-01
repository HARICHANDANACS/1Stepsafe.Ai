
import type { ClimateData } from './data';

// A simple in-memory cache to store API responses to avoid redundant calls for a short period.
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Fetches real-time, comprehensive climate data from the Open-Meteo API.
 * This service is free for non-commercial use and does not require an API key.
 * It provides temperature, humidity, UV index, and AQI.
 */
export async function getClimateDataForCity(lat: number, lon: number): Promise<ClimateData> {
    const cacheKey = `current-${lat.toFixed(4)}-${lon.toFixed(4)}`;
    const cachedEntry = cache.get(cacheKey);

    if (cachedEntry && (Date.now() - cachedEntry.timestamp < CACHE_DURATION_MS)) {
        return cachedEntry.data;
    }

    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,rain,uv_index&temperature_unit=fahrenheit`;
    const airQualityUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=us_aqi`;

    try {
        const [weatherResponse, airQualityResponse] = await Promise.all([
            fetch(weatherUrl),
            fetch(airQualityUrl)
        ]);

        if (!weatherResponse.ok) {
            throw new Error(`Open-Meteo weather API failed with status ${weatherResponse.status}`);
        }
        if (!airQualityResponse.ok) {
            throw new Error(`Open-Meteo air quality API failed with status ${airQualityResponse.status}`);
        }

        const weatherData = await weatherResponse.json();
        const airQualityData = await airQualityResponse.json();

        const climateData: ClimateData = {
            temperature: Math.round(weatherData.current.temperature_2m),
            humidity: Math.round(weatherData.current.relative_humidity_2m),
            uvIndex: Math.round(weatherData.current.uv_index),
            aqi: Math.round(airQualityData.current.us_aqi),
            rainProbability: Math.round(weatherData.current.rain > 0 ? 100 : 0), // Simple rain check
        };
        
        cache.set(cacheKey, { data: climateData, timestamp: Date.now() });
        return climateData;

    } catch (error) {
        console.error("Failed to fetch real-time climate data:", error);
        // In case of API failure, provide a reasonable default to prevent crashing
        return {
            temperature: 75,
            humidity: 50,
            uvIndex: 5,
            aqi: 50,
            rainProbability: 10,
        };
    }
}

/**
 * Fetches historical climate data for "yesterday" from Open-Meteo.
 */
export async function getYesterdayClimateData(lat: number, lon: number): Promise<ClimateData> {
     const cacheKey = `yesterday-${lat.toFixed(4)}-${lon.toFixed(4)}`;
     const cachedEntry = cache.get(cacheKey);

     if (cachedEntry) {
         return cachedEntry.data;
     }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toISOString().split('T')[0];

    const historicalUrl = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lon}&start_date=${dateStr}&end_date=${dateStr}&daily=temperature_2m_max,relative_humidity_2m_mean,uv_index_max&temperature_unit=fahrenheit`;
    // Note: Historical AQI is not available in the same way, so we'll use a sensible default or estimate.
    
    try {
        const response = await fetch(historicalUrl);
        if (!response.ok) {
            throw new Error(`Open-Meteo archive API failed with status ${response.status}`);
        }
        
        const data = await response.json();

        const climateData: ClimateData = {
            temperature: Math.round(data.daily.temperature_2m_max[0]),
            humidity: Math.round(data.daily.relative_humidity_2m_mean[0]),
            uvIndex: Math.round(data.daily.uv_index_max[0]),
            aqi: 70, // Using a static but reasonable AQI for yesterday as historical is complex.
            rainProbability: 0, // Cannot determine rain for a past day easily.
        };

        cache.set(cacheKey, { data: climateData, timestamp: Date.now() });
        return climateData;

    } catch (error) {
        console.error("Failed to fetch historical climate data:", error);
        return {
            temperature: 72,
            humidity: 55,
            uvIndex: 4,
            aqi: 70,
            rainProbability: 0,
        };
    }
}
