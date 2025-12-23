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

const GenerateConciseSafetyAdvisoryInputSchema = z.object({
  heatRisk: z.enum(['Low', 'Medium', 'High', 'Extreme']).describe('The heat risk level.'),
  uvRisk: z.enum(['Low', 'Medium', 'High', 'Extreme']).describe('The UV risk level.'),
  aqiRisk: z.enum(['Low', 'Medium', 'High', 'Extreme']).describe('The AQI risk level.'),
  humidityDiscomfort: z.enum(['Low', 'Medium', 'High', 'Extreme']).describe('The humidity discomfort level.'),
  rainExposure: z.enum(['Low', 'Medium', 'High', 'Extreme']).describe('The rain exposure risk level.'),
});
export type GenerateConciseSafetyAdvisoryInput = z.infer<typeof GenerateConciseSafetyAdvisoryInputSchema>;

const GenerateConciseSafetyAdvisoryOutputSchema = z.object({
  advisory: z.string().describe('A concise safety advisory based on the risk levels.'),
});
export type GenerateConciseSafetyAdvisoryOutput = z.infer<typeof GenerateConciseSafetyAdvisoryOutputSchema>;

export async function generateConciseSafetyAdvisory(input: GenerateConciseSafetyAdvisoryInput): Promise<GenerateConciseSafetyAdvisoryOutput> {
  return generateConciseSafetyAdvisoryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateConciseSafetyAdvisoryPrompt',
  input: {schema: GenerateConciseSafetyAdvisoryInputSchema},
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
    inputSchema: GenerateConciseSafetyAdvisoryInputSchema,
    outputSchema: GenerateConciseSafetyAdvisoryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
