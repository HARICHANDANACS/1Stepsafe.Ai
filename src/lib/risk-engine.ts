import {
  Thermometer,
  Sun,
  Wind,
  Droplets,
  Cloudy,
  GlassWater,
  Shirt,
  Sunscreen as SunscreenIcon,
  Umbrella,
  CloudRain,
} from "lucide-react";
import type {
  ClimateData,
  UserInput,
  RiskProfile,
  Risk,
  RiskLevel,
  ChecklistItem,
  TimeWindow,
} from "./data";
import {createElement} from 'react';

const MaskIcon = (props: React.SVGProps<SVGSVGElement>) =>
  createElement(
    'svg',
    {
      ...props,
      xmlns: 'http://www.w3.org/2000/svg',
      width: '24',
      height: '24',
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: '2',
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
    },
    [
      createElement('path', {
        d: 'M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z',
        key: '1',
      }),
      createElement('path', {
        d: 'M12 12a4.002 4.002 0 0 0-4 4h8a4.002 4.002 0 0 0-4-4z',
        key: '2',
      }),
      createElement('path', { d: 'M16 12.5a2.5 2.5 0 1 1-5 0', key: '3' }),
    ]
  );

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

export function analyzeRisks(climateData: ClimateData, userInput?: UserInput): RiskProfile {
  return {
    heatRisk: getHeatRisk(climateData.temperature, climateData.humidity),
    uvRisk: getUvRisk(climateData.uvIndex),
    aqiRisk: getAqiRisk(climateData.aqi),
    humidityDiscomfort: getHumidityDiscomfort(climateData.humidity),
    rainExposure: getRainExposure(climateData.rainProbability),
  };
}

export function generateChecklist(riskProfile: RiskProfile): ChecklistItem[] {
  const checklist: ChecklistItem[] = [];

  // Water Intake
  if (riskProfile.heatRisk.level === "Extreme" || riskProfile.heatRisk.level === "High") {
    checklist.push({
      id: "water",
      recommendation: "Stay extra hydrated",
      details: "Drink at least 3-4 liters of water throughout the day.",
      Icon: GlassWater,
    });
  } else {
    checklist.push({
      id: "water",
      recommendation: "Standard hydration",
      details: "Aim for 2 liters of water today.",
      Icon: GlassWater,
    });
  }

  // Clothing
  if (riskProfile.heatRisk.level === "Extreme" || riskProfile.heatRisk.level === "High") {
    checklist.push({
      id: "clothing",
      recommendation: "Wear light, breathable clothing",
      details: "Choose loose-fitting, light-colored fabrics.",
      Icon: Shirt,
    });
  } else {
     checklist.push({
      id: "clothing",
      recommendation: "Dress for comfort",
      details: "Standard clothing is appropriate for today's temperature.",
      Icon: Shirt,
    });
  }

  // Sunscreen
  if (riskProfile.uvRisk.level === "Extreme" || riskProfile.uvRisk.level === "High") {
    checklist.push({
      id: "sunscreen",
      recommendation: "Apply SPF 30+ sunscreen",
      details: "Reapply every 2 hours, especially if sweating.",
      Icon: SunscreenIcon,
    });
  } else if (riskProfile.uvRisk.level === "Medium") {
    checklist.push({
      id: "sunscreen",
      recommendation: "Consider using sunscreen",
      details: "Sun protection is advisable, even on cloudy days.",
      Icon: SunscreenIcon,
    });
  }

  // Rain Gear
  if (riskProfile.rainExposure.level === "High") {
    checklist.push({
      id: "rain",
      recommendation: "Bring an umbrella or raincoat",
      details: "Rain is highly likely today.",
      Icon: CloudRain,
    });
  } else if (riskProfile.rainExposure.level === "Medium") {
    checklist.push({
        id: "rain",
        recommendation: "Pack an umbrella",
        details: "There's a chance of scattered showers.",
        Icon: Umbrella,
      });
  }

  // AQI Mask
  if (riskProfile.aqiRisk.level === "Extreme" || riskProfile.aqiRisk.level === "High") {
    checklist.push({
      id: "mask",
      recommendation: "Wear a high-quality mask (N95/KN95)",
      details: "Limit outdoor time due to poor air quality.",
      Icon: MaskIcon,
    });
  }

  return checklist;
}

export function generateTimeWindows(riskProfile: RiskProfile): TimeWindow[] {
    const windows: TimeWindow[] = [];

    const isUvHigh = riskProfile.uvRisk.level === 'High' || riskProfile.uvRisk.level === 'Extreme';
    const isHeatHigh = riskProfile.heatRisk.level === 'High' || riskProfile.heatRisk.level === 'Extreme';

    if(isUvHigh || isHeatHigh) {
        windows.push({ period: "11:00 AM - 4:00 PM", level: "Unsafe", reason: "Peak UV and heat levels. Best to stay indoors." });
        windows.push({ period: "Before 11:00 AM", level: "Safer", reason: "Cooler temperatures and lower UV exposure." });
        windows.push({ period: "After 4:00 PM", level: "Safer", reason: "Sun is less intense and temperatures start to drop." });
    } else {
        windows.push({ period: "All Day", level: "Safer", reason: "Conditions are favorable for outdoor activities throughout the day." });
    }
    
    return windows.sort((a,b) => a.period.localeCompare(b.period));
}
