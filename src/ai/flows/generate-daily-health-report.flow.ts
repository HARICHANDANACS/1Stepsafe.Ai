'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating a complete daily health report for the user.
 * It combines the daily summary, a concise safety advisory, and detailed phase-by-phase guidance into a single, efficient call.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import type { UserProfile, ClimateData, RiskProfile } from '@/lib/data';
import { UserProfileSchema, ClimateDataSchema, DailyHealthReportSchema } from '@/lib/schemas';
import { analyzeRisks } from '@/lib/risk-engine';

const GenerateDailyHealthReportInputSchema = z.object({
    userProfile: UserProfileSchema,
    todayClimate: ClimateDataSchema,
    yesterdayClimate: ClimateDataSchema,
});

export type GenerateDailyHealthReportInput = z.infer<typeof GenerateDailyHealthReportInputSchema>;
export type GenerateDailyHealthReportOutput = z.infer<typeof DailyHealthReportSchema>;

export async function generateDailyHealthReport(input: GenerateDailyHealthReportInput): Promise<GenerateDailyHealthReportOutput> {
    const tempChange = input.todayClimate.temperature - input.yesterdayClimate.temperature;
    const aqiChange = input.todayClimate.aqi - input.yesterdayClimate.aqi;
    
    const riskProfile = analyzeRisks(input.todayClimate);

    // Define the phases based on user's routine
    const lifePhases = [
        { 
            phase: 'Morning Commute' as const, 
            startTime: input.userProfile.routine.morningCommuteStart,
            endTime: input.userProfile.routine.workHoursStart,
        },
        { 
            phase: 'Work Hours' as const,
            startTime: input.userProfile.routine.workHoursStart,
            endTime: input.userProfile.routine.eveningCommuteStart,
        },
        {
            phase: 'Evening Commute' as const,
            startTime: input.userProfile.routine.eveningCommuteStart,
            // A simple way to define end of commute, could be more complex
            endTime: (parseInt(input.userProfile.routine.eveningCommuteStart.split(':')[0]) + 1).toString().padStart(2, '0') + ':00',
        }
    ];

    const flowInput = { 
        ...input, 
        tempChange, 
        aqiChange,
        riskProfile,
        lifePhases,
    };
    
    return generateDailyHealthReportFlow(flowInput);
}

const prompt = ai.definePrompt({
  name: 'dailyHealthReportPrompt',
  input: {
      schema: GenerateDailyHealthReportInputSchema.extend({
        tempChange: z.number(),
        aqiChange: z.number(),
        riskProfile: z.object({
            heatRisk: z.object({ level: z.string() }),
            uvRisk: z.object({ level: z.string() }),
            aqiRisk: z.object({ level: z.string() }),
            rainExposure: z.object({ level: z.string() }),
        }),
        lifePhases: z.array(z.object({
            phase: z.string(),
            startTime: z.string(),
            endTime: z.string(),
        }))
      }),
  },
  output: { schema: DailyHealthReportSchema },
  prompt: `You are StepSafe AI, a personal climate-health and human-security companion. Your goal is to provide a complete, personalized, and easy-to-understand daily risk assessment in a single response.

Analyze the user's profile and today's climate data to generate a comprehensive report.

**User Profile:**
- Location: {{{userProfile.location.city}}}
- Heat Sensitivity: {{{userProfile.sensitivities.heat}}}
- AQI Sensitive: {{{userProfile.sensitivities.aqi}}}
- Commute Type: {{{userProfile.commuteType}}}
- Health Profile: Age {{{userProfile.healthProfile.ageRange}}}, Skin Type {{{userProfile.healthProfile.skinType}}}

**Today's Climate:**
- Temperature: {{{todayClimate.temperature}}}°F
- Humidity: {{{todayClimate.humidity}}}%
- UV Index: {{{todayClimate.uvIndex}}}
- AQI: {{{todayClimate.aqi}}}
- Rain Probability: {{{todayClimate.rainProbability}}}%
- Heat Risk: {{{riskProfile.heatRisk.level}}}
- UV Risk: {{{riskProfile.uvRisk.level}}}

**Changes from Yesterday:**
- Temperature Change: {{{tempChange}}}°F
- AQI Change: {{{aqiChange}}}

**Life Phases for Today:**
{{#each lifePhases}}
- Phase: {{{phase}}}, Start: {{{startTime}}}, End: {{{endTime}}}
{{/each}}

**Your Tasks (Generate all sections in one JSON object):**

1.  **Generate \`dailySummary\` Section:**
    a.  **Calculate \`personalHealthRiskScore\` (0-100):** This is the MOST IMPORTANT output. Base score on raw climate data and **heavily weight it based on user sensitivities**. A "High" sensitivity user should have a much HIGHER score.
    b.  **Generate a \`quickInsight\` (1-2 sentences):** A human-friendly summary of the risk score. Example: "Your personal health risk is moderate today, mainly due to high afternoon heat."
    c.  **Set \`whatChanged\`:** Use the input \`tempChange\` and \`aqiChange\`.
    d.  **Identify \`safeWindows\`:** Create 3-4 contiguous time windows covering the 24-hour day. Mark midday (e.g., 12:00-16:00) as \`isSafe: false\`. The final window must end at "23:59".

2.  **Generate \`safetyAdvisory\` Section:**
    a.  **Create an \`advisory\` string (3-4 lines):** A concise, professional, and reassuring paragraph summarizing the overall daily risks and top precautions.

3.  **Generate \`dailyGuidance\` Section:**
    a.  **For EACH Life Phase, create a \`phase\` object:**
        i.   **Set Phase, Start, and End Times:** Use the exact values from the input.
        ii.  **Set phase-specific \`risks\`:** Use the overall risk levels provided.
        iii. **Generate a \`summary\` (1-2 sentences):** Explain the key points for THAT phase.
        iv. **Generate actionable \`recommendations\` (2-4 items):** Tailor these to the user's \`commuteType\`. A 'Walk' user needs different advice than a 'Drive' user.
`,
});

const generateDailyHealthReportFlow = ai.defineFlow(
  {
    name: 'generateDailyHealthReportFlow',
    inputSchema: GenerateDailyHealthReportInputSchema.extend({
        tempChange: z.number(),
        aqiChange: z.number(),
        riskProfile: z.custom<RiskProfile>(),
        lifePhases: z.array(z.object({
            phase: z.string(),
            startTime: z.string(),
            endTime: z.string(),
        }))
    }),
    outputSchema: DailyHealthReportSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
