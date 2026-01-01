import { z } from 'zod';

export const YesNoSchema = z.enum(['Yes', 'No']);

export const UserProfileSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Name is required.').optional(),
  location: z.object({
    city: z.string(),
    lat: z.number().optional(),
    lon: z.number().optional(),
  }),
  routine: z.object({
    morningCommuteStart: z.string(),
    workHoursStart: z.string(),
    eveningCommuteStart: z.string(),
  }),
  commuteType: z.enum(['Walk', 'Public Transport', 'Bike', 'Drive']),
  sensitivities: z.object({
    heat: z.enum(['Low', 'Medium', 'High']),
    aqi: z.enum(['Yes', 'No']),
  }),
  healthProfile: z.object({
    ageRange: z.enum(['18-29', '30-49', '50-64', '65+']).optional(),
    skinType: z.enum(['Very Fair', 'Fair', 'Medium', 'Olive', 'Brown', 'Black']).optional(),
    respiratoryHealth: z.enum(['Good', 'Moderate', 'Sensitive']).optional(),
  }).optional(),
});

export const ClimateDataSchema = z.object({
  temperature: z.number(),
  humidity: z.number(),
  uvIndex: z.number(),
  aqi: z.number(),
  rainProbability: z.number(),
});


export const LifePhaseSchema = z.enum([
  'Morning Commute',
  'Work Hours',
  'Evening Commute',
]);

export const RiskLevelSchema = z.enum(['Low', 'Medium', 'High', 'Extreme']);

// Part 1: Daily Summary Schema
const DailySummarySchema = z.object({
  personalHealthRiskScore: z.number().min(0).max(100).describe('A personalized health risk score from 0 to 100.'),
  quickInsight: z.string().describe('A concise, human-readable summary of the key risks and recommendations for the day.'),
  whatChanged: z.object({
    tempChange: z.number().describe('The change in temperature from yesterday to today.'),
    aqiChange: z.number().describe('The change in AQI from yesterday to today.'),
  }),
  safeWindows: z.array(z.object({
    start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).describe('The start time of the window (HH:MM).'),
    end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).describe('The end time of the window (HH:MM).'),
    isSafe: z.boolean().describe('Whether the window is considered safe or unsafe.'),
  })).describe('An array of time windows for the day, marked as safe or unsafe.'),
});

// Part 2: Safety Advisory Schema
const SafetyAdvisorySchema = z.object({
  advisory: z.string().describe('A concise safety advisory paragraph (3-4 lines) based on the risk levels.'),
});

// Part 3: Detailed Guidance Schema
const PhaseGuidanceSchema = z.object({
  phase: LifePhaseSchema,
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  risks: z.object({
    heatRisk: RiskLevelSchema,
    uvRisk: RiskLevelSchema,
    aqiRisk: RiskLevelSchema,
    rainExposure: RiskLevelSchema,
  }),
  recommendations: z.array(z.string()).describe('A checklist of 2-4 short, actionable recommendations for this phase.'),
  summary: z.string().describe('A concise, 1-2 sentence summary of the key advice for this phase.'),
});

const DailyGuidanceSchema = z.object({
  phases: z.array(PhaseGuidanceSchema),
});


// Final Uber-Schema: DailyHealthReport
export const DailyHealthReportSchema = z.object({
  dailySummary: DailySummarySchema.nullable(),
  safetyAdvisory: SafetyAdvisorySchema.nullable(),
  dailyGuidance: DailyGuidanceSchema.nullable(),
});
