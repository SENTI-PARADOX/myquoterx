'use server';
/**
 * @fileOverview An AI agent that reads a given quote aloud using text-to-speech.
 *
 * - readQuoteAloud - A function that handles the text-to-speech conversion process.
 * - ReadQuoteAloudInput - The input type for the readQuoteAloud function.
 * - ReadQuoteAloudOutput - The return type for the readQuoteAloud function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import wav from 'wav';
import {googleAI} from '@genkit-ai/google-genai';

const ReadQuoteAloudInputSchema = z.object({
  quote: z.string().describe('The quote to be read aloud.'),
});
export type ReadQuoteAloudInput = z.infer<typeof ReadQuoteAloudInputSchema>;

const ReadQuoteAloudOutputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      'The audio data URI of the quote read aloud, in WAV format encoded as base64.'
    ),
});
export type ReadQuoteAloudOutput = z.infer<typeof ReadQuoteAloudOutputSchema>;

export async function readQuoteAloud(input: ReadQuoteAloudInput): Promise<ReadQuoteAloudOutput> {
  return readQuoteAloudFlow(input);
}

const readQuoteAloudFlow = ai.defineFlow(
  {
    name: 'readQuoteAloudFlow',
    inputSchema: ReadQuoteAloudInputSchema,
    outputSchema: ReadQuoteAloudOutputSchema,
  },
  async (input) => {
    const {media} = await ai.generate({
      model: googleAI.model('gemini-2.5-flash-preview-tts'),
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {voiceName: 'Algenib'},
          },
        },
      },
      prompt: input.quote,
    });
    if (!media) {
      throw new Error('no media returned');
    }
    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );
    return {
      audioDataUri: 'data:audio/wav;base64,' + (await toWav(audioBuffer)),
    };
  }
);

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs = [] as any[];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}