import type { LucideIcon } from 'lucide-react';

export type ClimateSensitivity = 'Low' | 'Medium' | 'High';
export type CommuteType = 'Walk' | 'Bike' | 'Public Transport' | 'Drive';
export type AgeRange = '18-29' | '30-49' | '50-64' | '65+';
export type SkinType = 'Very Fair' | 'Fair' | 'Medium' | 'Olive' | 'Brown' | 'Black';
export type RespiratoryHealth = 'Good' | 'Moderate' | 'Sensitive';


export type DailyRoutine = {
  morningCommuteStart: string; // "HH:MM"
  workHoursStart: string;
  lunchStart: string;
  eveningCommuteStart: string;
};

export type UserProfile = {
  id: string; // Firebase Auth UID
  location: {
    city: string;
    lat: number;
    lon: number;
  };
  routine: DailyRoutine;
  commuteType: CommuteType;
  sensitivities: {
    heat: ClimateSensitivity;
    aqi: ClimateSensitivity;
    uv: ClimateSensitivity;
  };
  healthProfile?: {
    ageRange?: AgeRange;
    skinType?: SkinType;
    respiratoryHealth?: RespiratoryHealth;
  }
};

export type ClimateData = {
  temperature: number; // in Fahrenheit
  humidity: number; // in percentage
  uvIndex: number;
  aqi: number;
  rainProbability: number; // in percentage
};

export type LifePhase =
  | 'Morning Commute'
  | 'Work Hours'
  | 'Lunch'
  | 'Evening Commute'
  | 'Home Recovery';

export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Extreme';

export type Risk = {
  name: string;
  level: RiskLevel;
  explanation: string;
  Icon: LucideIcon;
};

export type RiskProfile = {
  heatRisk: Risk;
  uvRisk: Risk;
  aqiRisk: Risk;
  humidityDiscomfort: Risk;
  rainExposure: Risk;
};
