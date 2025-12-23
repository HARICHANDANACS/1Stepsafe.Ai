'use server';
import { z } from 'zod';

export const YesNoSchema = z.enum(['Yes', 'No']);

export const UserProfileSchema = z.object({
  id: z.string(),
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
