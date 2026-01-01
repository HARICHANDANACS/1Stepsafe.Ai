'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating a daily summary for the user.
 * It calculates a personal health risk score, provides a quick insight, and identifies safe/unsafe time windows.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import type { UserProfile, ClimateData } from '@/lib/data';
import { UserProfileSchema, ClimateDataSchema } from '@/lib/schemas';


const GenerateDailySummaryInputSchema = z.object({
    userProfile: UserProfileSchema,
    todayClimate: ClimateDataSchema,
    yesterdayClimate: ClimateDataSchema,
});

const GenerateDailySummaryOutputSchema = z.object({
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

export type GenerateDailySummaryInput = z.infer<typeof GenerateDailySummaryInputSchema>;
export type GenerateDailySummaryOutput = z.infer<typeof GenerateDailySummaryOutputSchema>;


export async function generateDailySummary(input: GenerateDailySummaryInput): Promise<GenerateDailySummaryOutput> {
  const tempChange = input.todayClimate.temperature - input.yesterdayClimate.temperature;
  const aqiChange = input.todayClimate.aqi - input.yesterdayClimate.aqi;

  const flowResult = await generateDailySummaryFlow({ ...input, tempChange, aqiChange });
  return flowResult;
}

const prompt = ai.definePrompt({
  name: 'dailySummaryPrompt',
  input: {
      schema: GenerateDailySummaryInputSchema.extend({
        tempChange: z.number(),
        aqiChange: z.number(),
      }),
  },
  output: { schema: GenerateDailySummaryOutputSchema },
  prompt: `You are StepSafe AI, a personal climate-health and human-security companion.
Your goal is to provide a personalized, easy-to-understand daily risk assessment.

Analyze the user's profile and today's climate data to generate a personalized summary.

**User Profile:**
- Location: {{{userProfile.location.city}}}
- Heat Sensitivity: {{{userProfile.sensitivities.heat}}}
- AQI Sensitive: {{{userProfile.sensitivities.aqi}}}
- Commute Type: {{{userProfile.commuteType}}}
- Morning Commute: {{{userProfile.routine.morningCommuteStart}}}
- Evening Commute: {{{userProfile.routine.eveningCommuteStart}}}

**Today's Climate:**
- Temperature: {{{todayClimate.temperature}}}°F
- Humidity: {{{todayClimate.humidity}}}%
- UV Index: {{{todayClimate.uvIndex}}}
- AQI: {{{todayClimate.aqi}}}
- Rain Probability: {{{todayClimate.rainProbability}}}%

**Changes from Yesterday:**
- Temperature Change: {{{tempChange}}}°F
- AQI Change: {{{aqiChange}}}

**Your Tasks:**

1.  **Calculate Personal Health Risk Score (0-100):**
    - This is the MOST IMPORTANT output. It must be a single number.
    - Base score on raw climate data: high temp, AQI, UV index are primary risk drivers.
    - **Weight the score based on user sensitivities.** A user with "High" heat sensitivity and "Yes" to AQI sensitivity should have a significantly HIGHER score than a "Low"/"No" user under the same conditions.
    - A score of 0 is a perfect day. A score of 100 is extremely dangerous. A score around 50 is a moderately risky day.

2.  **Generate a "Quick Insight" (1-2 sentences):**
    - This is a human-friendly summary of the risk score.
    - Example: "Your personal health risk is moderate today, mainly due to high afternoon heat. Plan to hydrate and take it easy during your evening commute."
    - Be professional, calm, and reassuring.

3.  **Identify Safe and Unsafe Time Windows:**
    - The output must be an array of time blocks covering the whole day (e.g., 00:00-06:00, 06:00-09:00, etc.).
    - Analyze the UV index and heat/humidity as the primary factors for safety.
    - The most dangerous window is almost always midday (e.g., 12:00-16:00) when UV and heat peak. Mark this as \`isSafe: false\`.
    - Early morning and late evening are usually safer. Mark these as \`isSafe: true\`.
    - Create at least 3-4 distinct time windows. The windows must be contiguous and cover a 24-hour period. **IMPORTANT: The final window must end at "23:59", do not use "24:00".**

4. **Set \`whatChanged\` values:**
    - This should already be provided as input. Just pass it through to the output.
`,
});

const generateDailySummaryFlow = ai.defineFlow(
  {
    name: 'generateDailySummaryFlow',
    inputSchema: GenerateDailySummaryInputSchema.extend({
        tempChange: z.number(),
        aqiChange: z.number(),
      }),
    outputSchema: GenerateDailySummaryOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
