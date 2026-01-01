'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating a concise safety advisory based on calculated risk levels.
 *
 * - generateConciseSafetyAdvisory - A function that generates a concise safety advisory.
 * - GenerateConciseSafetyAdvisoryInput - The input type for the generateConciseSafetyAdvisory function.
 * - GenerateConciseSafetyAdvisoryOutput - The return type for the generateConciseSafetyAdvisory function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { analyzeRisks } from '@/lib/risk-engine';
import type { ClimateData } from '@/lib/data';
import { ClimateDataSchema }from '@/lib/schemas';

const GenerateConciseSafetyAdvisoryInputSchema = z.object({
  climateData: ClimateDataSchema,
});
export type GenerateConciseSafetyAdvisoryInput = z.infer<typeof GenerateConciseSafetyAdvisoryInputSchema>;

const GenerateConciseSafetyAdvisoryOutputSchema = z.object({
  advisory: z.string().describe('A concise safety advisory paragraph (3-4 lines) based on the risk levels.'),
});
export type GenerateConciseSafetyAdvisoryOutput = z.infer<typeof GenerateConciseSafetyAdvisoryOutputSchema>;

export async function generateConciseSafetyAdvisory(input: GenerateConciseSafetyAdvisoryInput): Promise<GenerateConciseSafetyAdvisoryOutput> {
  const riskProfile = analyzeRisks(input.climateData);
  const flowInput = {
    heatRisk: riskProfile.heatRisk.level,
    uvRisk: riskProfile.uvRisk.level,
    aqiRisk: riskProfile.aqiRisk.level,
    humidityDiscomfort: riskProfile.humidityDiscomfort.level,
    rainExposure: riskProfile.rainExposure.level,
  };
  return generateConciseSafetyAdvisoryFlow(flowInput);
}

const prompt = ai.definePrompt({
  name: 'generateConciseSafetyAdvisoryPrompt',
  input: {schema: z.object({
    heatRisk: z.string(),
    uvRisk: z.string(),
    aqiRisk: z.string(),
    humidityDiscomfort: z.string(),
    rainExposure: z.string(),
  })},
  output: {schema: GenerateConciseSafetyAdvisoryOutputSchema},
  prompt: `You are a public health safety advisor. You will receive risk scores for different climate factors, and must summarize the overall risk and provide clear, professional, non-alarming advice to the user.

  Here are the risk levels:
  Heat Risk: {{{heatRisk}}}
  UV Risk: {{{uvRisk}}}
  AQI Risk: {{{aqiRisk}}}
  Humidity Discomfort: {{{humidityDiscomfort}}}
  Rain Exposure: {{{rainExposure}}}

  Provide a short advisory paragraph (3-4 lines) summarizing the risks and recommending precautions. Be professional, clear, and reassuring.
  `,
});

const generateConciseSafetyAdvisoryFlow = ai.defineFlow(
  {
    name: 'generateConciseSafetyAdvisoryFlow',
    inputSchema: z.object({
        heatRisk: z.string(),
        uvRisk: z.string(),
        aqiRisk: z.string(),
        humidityDiscomfort: z.string(),
        rainExposure: z.string(),
    }),
    outputSchema: GenerateConciseSafetyAdvisoryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
