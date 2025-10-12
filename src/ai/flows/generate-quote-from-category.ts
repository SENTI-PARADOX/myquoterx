'use server';

/**
 * @fileOverview Generates a quote based on the selected category using AI.
 *
 * - generateQuoteFromCategory - A function that generates a quote based on the selected category.
 * - GenerateQuoteFromCategoryInput - The input type for the generateQuoteFromCategory function.
 * - GenerateQuoteFromCategoryOutput - The return type for the generateQuoteFromCategory function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateQuoteFromCategoryInputSchema = z.object({
  category: z
    .enum(['motivational', 'love', 'life', 'sad'])
    .describe('The category of the quote to generate.'),
});

export type GenerateQuoteFromCategoryInput = z.infer<typeof GenerateQuoteFromCategoryInputSchema>;

const GenerateQuoteFromCategoryOutputSchema = z.object({
  quote: z.string().describe('The generated quote.'),
});

export type GenerateQuoteFromCategoryOutput = z.infer<typeof GenerateQuoteFromCategoryOutputSchema>;

export async function generateQuoteFromCategory(
  input: GenerateQuoteFromCategoryInput
): Promise<GenerateQuoteFromCategoryOutput> {
  return generateQuoteFromCategoryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateQuoteFromCategoryPrompt',
  input: {schema: GenerateQuoteFromCategoryInputSchema},
  output: {schema: GenerateQuoteFromCategoryOutputSchema},
  prompt: `You are an AI quote generator. Generate a quote for the following category: {{{category}}}.`,
});

const generateQuoteFromCategoryFlow = ai.defineFlow(
  {
    name: 'generateQuoteFromCategoryFlow',
    inputSchema: GenerateQuoteFromCategoryInputSchema,
    outputSchema: GenerateQuoteFromCategoryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
