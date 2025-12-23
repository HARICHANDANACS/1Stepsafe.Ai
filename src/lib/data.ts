import type { LucideIcon } from 'lucide-react';

export type ClimateSensitivity = 'Low' | 'Medium' | 'High';
export type CommuteType = 'Walk' | 'Bike' | 'Public Transport' | 'Drive';
export type AgeRange = '18-29' | '30-49' | '50-64' | '65+';
export type SkinType = 'Very Fair' | 'Fair' | 'Medium' | 'Olive' | 'Brown' | 'Black';
export type RespiratoryHealth = 'Good' | 'Moderate' | 'Sensitive';
export type YesNo = 'Yes' | 'No';

export type DailyRoutine = {
  morningCommuteStart: string; // "HH:MM"
  workHoursStart: string;
  lunchStart: string;
  eveningCommuteStart: string;
};

export type UserProfile = {
  id: string; // Firebase Auth UID
  name: string;
  location: {
    city: string;
    lat?: number;
    lon?: number;
  };
  routine: {
    morningCommuteStart: string; // "HH:MM"
    workHoursStart: string;
    eveningCommuteStart: string;
  };
  commuteType: 'Walk' | 'Public Transport' | 'Bike' | 'Drive';
  sensitivities: {
    heat: 'Low' | 'Medium' | 'High';
    aqi: YesNo;
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


export type DailySummary = {
    personalHealthRiskScore: number;
    quickInsight: string;
    whatChanged: {
        tempChange: number;
        aqiChange: number;
    };
    safeWindows: {
        start: string; // "HH:MM"
        end: string; // "HH:MM"
        isSafe: boolean;
    }[];
};
