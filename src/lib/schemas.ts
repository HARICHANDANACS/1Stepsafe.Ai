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
    aqi: z.preprocess((val) => {
        if (val === 'Medium' || val === 'High') return 'Yes';
        if (val === 'Low') return 'No';
        return val;
    }, z.enum(['Yes', 'No'])),
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

export const PhaseGuidanceSchema = z.object({
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

export const DailyGuidanceSchema = z.object({
  phases: z.array(PhaseGuidanceSchema),
});
