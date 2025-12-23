import type { LucideIcon } from "lucide-react";

export type AgeGroup = "Child" | "Adult" | "Elderly";
export type ActivityLevel = "Low" | "Medium" | "High";

export type UserInput = {
  city: string;
  ageGroup?: AgeGroup;
  activityLevel?: ActivityLevel;
};

export type ClimateData = {
  temperature: number; // in Fahrenheit
  humidity: number; // in percentage
  uvIndex: number;
  aqi: number;
  rainProbability: number; // in percentage
};

export type RiskLevel = "Low" | "Medium" | "High" | "Extreme";

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

export type ChecklistItem = {
  id: string;
  recommendation: string;
  details: string;
  Icon: LucideIcon;
};

export type TimeWindow = {
  period: string;
  level: "Safer" | "Unsafe";
  reason: string;
};
