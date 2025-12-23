import type { ClimateData } from './data';

// A simple in-memory cache to store mock data for cities.
const cityClimateCache: Record<string, ClimateData> = {};
const yesterdayCityClimateCache: Record<string, ClimateData> = {};


const createDeterministicRandom = (seed: number) => {
    let state = seed;
    return () => {
        const x = Math.sin(state++) * 10000;
        return x - Math.floor(x);
    };
}


const generateClimateData = (city: string, seedOffset = 0): ClimateData => {
  // Create a pseudo-random but deterministic seed from the city name
  let seed = 0;
  for (let i = 0; i < city.length; i++) {
    seed = (seed + city.charCodeAt(i));
  }
  seed += seedOffset;

  const random = createDeterministicRandom(seed);

  const data: ClimateData = {
    temperature: Math.round(65 + (random() * 50 - 15)),
    humidity: Math.max(0, Math.min(100, Math.round(50 + (random() * 70 - 30)))),
    uvIndex: Math.floor(random() * 12),
    aqi: Math.floor(10 + random() * 240),
    rainProbability: Math.floor(random() * 101),
  };

  return data;
}


/**
 * Generates somewhat realistic, randomized climate data for a given city for "today".
 * This acts as a mock for a real weather API.
 * The data is cached to ensure consistency for the same city within a session.
 */
export function getClimateDataForCity(city: string): ClimateData {
  if (cityClimateCache[city]) {
    return cityClimateCache[city];
  }

  const data = generateClimateData(city, 1); // Use seed offset 1 for today
  cityClimateCache[city] = data;
  return data;
}

/**
 * Generates somewhat realistic, randomized climate data for a given city for "yesterday".
 * This acts as a mock for a real weather API.
 * The data is cached to ensure consistency for the same city within a session.
 */
export function getYesterdayClimateData(city: string): ClimateData {
    if (yesterdayCityClimateCache[city]) {
        return yesterdayCityClimateCache[city];
    }
    const data = generateClimateData(city, 0); // Use seed offset 0 for yesterday
    yesterdayCityClimateCache[city] = data;
    return data;
}
