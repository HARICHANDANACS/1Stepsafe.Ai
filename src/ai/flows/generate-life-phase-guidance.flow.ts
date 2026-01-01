'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating detailed, phase-by-phase daily guidance.
 *
 * - generateLifePhaseGuidance - A function that generates the detailed guidance.
 * - GenerateLifePhaseGuidanceInput - The input type for the function.
 * - GenerateLifePhaseGuidanceOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { UserProfileSchema, ClimateDataSchema, DailyGuidanceSchema, PhaseGuidanceSchema, LifePhaseSchema } from '@/lib/schemas';
import { analyzeRisks } from '@/lib/risk-engine';

const GenerateLifePhaseGuidanceInputSchema = z.object({
  userProfile: UserProfileSchema,
  climateData: ClimateDataSchema,
});

export type GenerateLifePhaseGuidanceInput = z.infer<typeof GenerateLifePhaseGuidanceInputSchema>;
export type GenerateLifePhaseGuidanceOutput = z.infer<typeof DailyGuidanceSchema>;


export async function generateLifePhaseGuidance(input: GenerateLifePhaseGuidanceInput): Promise<GenerateLifePhaseGuidanceOutput> {
    const riskProfile = analyzeRisks(input.climateData);

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
        riskProfile,
        lifePhases,
    };

    return generateLifePhaseGuidanceFlow(flowInput);
}

const prompt = ai.definePrompt({
  name: 'lifePhaseGuidancePrompt',
  input: {
    schema: GenerateLifePhaseGuidanceInputSchema.extend({
      riskProfile: z.any(), // Using any for the complex RiskProfile type for simplicity
      lifePhases: z.array(z.object({
          phase: LifePhaseSchema,
          startTime: z.string(),
          endTime: z.string(),
      }))
    }),
  },
  output: { schema: DailyGuidanceSchema },
  prompt: `You are StepSafe AI, a personal climate-health and human-security companion.
Your goal is to provide specific, actionable guidance for each phase of a user's day.

**Analyze the user's profile, today's climate data, and the defined life phases to generate guidance.**

**User Profile:**
- Location: {{{userProfile.location.city}}}
- Heat Sensitivity: {{{userProfile.sensitivities.heat}}}
- AQI Sensitive: {{{userProfile.sensitivities.aqi}}}
- Commute Type: {{{userProfile.commuteType}}}
- Health Profile: Age {{{userProfile.healthProfile.ageRange}}}, Skin Type {{{userProfile.healthProfile.skinType}}}

**Today's Climate Risk Profile:**
- Heat Risk: {{{riskProfile.heatRisk.level}}}
- UV Risk: {{{riskProfile.uvRisk.level}}}
- AQI Risk: {{{riskProfile.aqiRisk.level}}}
- Rain Probability: {{{riskProfile.rainExposure.level}}}

**Life Phases for Today:**
{{#each lifePhases}}
- Phase: {{{phase}}}, Start: {{{startTime}}}, End: {{{endTime}}}
{{/each}}

**Your Tasks (For EACH Life Phase):**

1.  **Set Phase, Start, and End Times:** Use the exact values from the input for each phase.
2.  **Determine Phase-Specific Risks:** Set the 'risks' object for each phase. Use the overall risk levels provided above. The risks are constant throughout the day for this version.
3.  **Generate a Concise Summary (1-2 sentences):** Explain the most important things the user needs to know for THAT specific phase. Be direct and clear.
    - Example for Morning Commute: "Your commute will be cool and clear, but UV levels are already moderate. AQI is good, so enjoy the fresh air."
4.  **Generate Actionable Recommendations (2-4 items):** Create a checklist of simple, practical actions.
    - **Crucially, tailor recommendations to the commute type.** A user who 'Walks' needs different advice than someone who 'Drives'.
    - For 'Walk' or 'Bike': recommend sunscreen, hats, water, appropriate clothing.
    - For 'Drive': recommendations are less critical but can include pre-cooling the car.
    - For 'Work Hours': focus on hydration, taking breaks, and whether it's safe to go out for lunch.
    - Example: ["Apply sunscreen before you leave", "Carry a water bottle", "Wear sunglasses"]
`,
});

const generateLifePhaseGuidanceFlow = ai.defineFlow(
  {
    name: 'generateLifePhaseGuidanceFlow',
    inputSchema: GenerateLifePhaseGuidanceInputSchema.extend({
        riskProfile: z.any(),
        lifePhases: z.array(z.object({
            phase: LifePhaseSchema,
            startTime: z.string(),
            endTime: z.string(),
        }))
    }),
    outputSchema: DailyGuidanceSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
