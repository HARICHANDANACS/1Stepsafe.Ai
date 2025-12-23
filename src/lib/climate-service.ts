import type { ClimateData } from './data';

// A simple in-memory cache to store mock data for cities.
const cityClimateCache: Record<string, ClimateData> = {};

/**
 * Generates somewhat realistic, randomized climate data for a given city.
 * This acts as a mock for a real weather API.
 * The data is cached to ensure consistency for the same city within a session.
 */
export function getClimateDataForCity(city: string): ClimateData {
  if (cityClimateCache[city]) {
    return cityClimateCache[city];
  }

  // Create a pseudo-random but deterministic seed from the city name
  let seed = 0;
  for (let i = 0; i < city.length; i++) {
    seed = (seed + city.charCodeAt(i)) % 1000;
  }
  const random = () => (Math.sin(seed++) * 10000) % 1;


  const data: ClimateData = {
    // Temperature: Base 65F, random variation between -15F and +35F
    temperature: Math.round(65 + (random() * 50 - 15)),
    // Humidity: Base 50%, random variation between -30% and +40%
    humidity: Math.max(0, Math.min(100, Math.round(50 + (random() * 70 - 30)))),
    // UV Index: Integer between 0 and 11
    uvIndex: Math.floor(random() * 12),
    // AQI: Integer between 10 and 250
    aqi: Math.floor(10 + random() * 240),
    // Rain Probability: Integer between 0 and 100
    rainProbability: Math.floor(random() * 101),
  };

  // Cache the generated data
  cityClimateCache[city] = data;

  return data;
}
