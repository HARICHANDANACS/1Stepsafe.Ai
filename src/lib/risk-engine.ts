import {
  Thermometer,
  Sun,
  Wind,
  Droplets,
  Cloudy,
} from "lucide-react";
import type {
  ClimateData,
  RiskProfile,
  Risk,
  RiskLevel,
} from "./data";

function getHeatRisk(temp: number, humidity: number): Risk {
  const heatIndex = -42.379 + 2.04901523 * temp + 10.14333127 * humidity - 0.22475541 * temp * humidity - 6.83783e-3 * temp * temp - 5.481717e-2 * humidity * humidity + 1.22874e-3 * temp * temp * humidity + 8.5282e-4 * temp * humidity * humidity - 1.99e-6 * temp * temp * humidity * humidity;

  let level: RiskLevel = "Low";
  let explanation = "Pleasant conditions. Enjoy your time outdoors.";

  if (heatIndex >= 103) {
    level = "Extreme";
    explanation = "Dangerous heat. Avoid outdoor activity.";
  } else if (heatIndex >= 90) {
    level = "High";
    explanation = "High heat. Limit exertion and stay hydrated.";
  } else if (heatIndex >= 80) {
    level = "Medium";
    explanation = "Warm conditions. Take breaks in the shade.";
  }

  return { name: "Heat Risk", level, explanation, Icon: Thermometer };
}

function getUvRisk(uvIndex: number): Risk {
  let level: RiskLevel = "Low";
  let explanation = "Low danger from the sun's UV rays for the average person.";

  if (uvIndex >= 11) {
    level = "Extreme";
    explanation = "Extreme risk of harm from unprotected sun exposure.";
  } else if (uvIndex >= 8) {
    level = "Extreme";
    explanation = "Very high risk of harm from unprotected sun exposure.";
  } else if (uvIndex >= 6) {
    level = "High";
    explanation = "High risk of harm from unprotected sun exposure.";
  } else if (uvIndex >= 3) {
    level = "Medium";
    explanation = "Moderate risk of harm from unprotected sun exposure.";
  }
  return { name: "UV Risk", level, explanation, Icon: Sun };
}

function getAqiRisk(aqi: number): Risk {
  let level: RiskLevel = "Low";
  let explanation = "Air quality is considered satisfactory, and air pollution poses little or no risk.";

  if (aqi > 200) {
    level = "Extreme";
    explanation = "Health alert: everyone may experience more serious health effects.";
  } else if (aqi > 150) {
    level = "High";
    explanation = "Everyone may begin to experience health effects; members of sensitive groups may experience more serious health effects.";
  } else if (aqi > 100) {
    level = "High";
    explanation = "Members of sensitive groups may experience health effects. The general public is not likely to be affected.";
  } else if (aqi > 50) {
    level = "Medium";
    explanation = "Air quality is acceptable; however, for some pollutants there may be a moderate health concern for a very small number of people.";
  }
  return { name: "Air Quality (AQI)", level, explanation, Icon: Wind };
}

function getHumidityDiscomfort(humidity: number): Risk {
  let level: RiskLevel = "Low";
  let explanation = "Comfortable humidity levels.";

  if (humidity > 70) {
    level = "High";
    explanation = "High humidity can make it feel warmer and may cause discomfort.";
  } else if (humidity > 60) {
    level = "Medium";
    explanation = "Humidity is noticeable and may feel slightly muggy.";
  }

  return { name: "Humidity Comfort", level, explanation, Icon: Droplets };
}

function getRainExposure(rainProbability: number): Risk {
  let level: RiskLevel = "Low";
  let explanation = "Low chance of rain. Clear skies expected.";

  if (rainProbability > 70) {
    level = "High";
    explanation = "High probability of rain. Pack an umbrella.";
  } else if (rainProbability > 40) {
    level = "Medium";
    explanation = "Moderate chance of scattered showers.";
  }

  return { name: "Rain Exposure", level, explanation, Icon: Cloudy };
}

export function analyzeRisks(climateData: ClimateData): RiskProfile {
  return {
    heatRisk: getHeatRisk(climateData.temperature, climateData.humidity),
    uvRisk: getUvRisk(climateData.uvIndex),
    aqiRisk: getAqiRisk(climateData.aqi),
    humidityDiscomfort: getHumidityDiscomfort(climateData.humidity),
    rainExposure: getRainExposure(climateData.rainProbability),
  };
}
