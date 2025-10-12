'use server';

/**
 * @fileOverview Generates a pack of unique quotes for various categories.
 *
 * - generateQuotePack - Generates a specified number of unique quotes for a given category.
 * - GenerateQuotePackInput - The input type for the generateQuotePack function.
 * - GenerateQuotePackOutput - The return type for the generateQuotePack function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateQuotePackInputSchema = z.object({
  category: z.string().describe('The category for which to generate quotes.'),
  count: z.number().min(1).max(250).describe('The number of unique quotes to generate.'),
});

export type GenerateQuotePackInput = z.infer<typeof GenerateQuotePackInputSchema>;

const GenerateQuotePackOutputSchema = z.object({
  quotes: z.array(z.string()).describe('An array of generated unique quotes.'),
});

export type GenerateQuotePackOutput = z.infer<typeof GenerateQuotePackOutputSchema>;

export async function generateQuotePack(
  input: GenerateQuotePackInput
): Promise<GenerateQuotePackOutput> {
  return generateQuotePackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateQuotePackPrompt',
  input: {schema: GenerateQuotePackInputSchema},
  output: {schema: GenerateQuotePackOutputSchema},
  prompt: `You are an AI quote generator. Generate {{{count}}} unique quotes for the following category: {{{category}}}. Do not repeat any quotes.`,
});

const generateQuotePackFlow = ai.defineFlow(
  {
    name: 'generateQuotePackFlow',
    inputSchema: GenerateQuotePackInputSchema,
    outputSchema: GenerateQuotePackOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
