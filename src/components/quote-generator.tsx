"use client";

import { useState, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import { generateQuoteFromCategory } from '@/ai/flows/generate-quote-from-category';
import type { GenerateQuoteFromCategoryInput } from '@/ai/flows/generate-quote-from-category';
import { readQuoteAloud } from '@/ai/flows/read-quote-aloud';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import { Heart, LoaderCircle, Road, Share2, Sunrise, Droplets, Volume2, VolumeX } from 'lucide-react';

type Category = GenerateQuoteFromCategoryInput['category'];

const categories: { value: Category; label: string; icon: React.ElementType }[] = [
  { value: 'motivational', label: 'Motivational', icon: Sunrise },
  { value: 'love', label: 'Love', icon: Heart },
  { value: 'life', label: 'Life', icon: Road },
  { value: 'sad', label: 'Sad', icon: Droplets },
];

const parseQuote = (fullQuote: string): { quote: string; author: string } => {
  const parts = fullQuote.split(' - ');
  if (parts.length > 1) {
    const author = parts.pop()?.trim() ?? 'Anonymous';
    const quote = parts.join(' - ').trim();
    if (author.length < 50 && author.split(' ').length < 7) {
      return { quote: quote.replace(/^"|"$/g, ''), author };
    }
  }
  return { quote: fullQuote.replace(/^"|"$/g, ''), author: 'Anonymous' };
};

export function QuoteGenerator() {
  const [selectedCategory, setSelectedCategory] = useState<Category>('motivational');
  const [currentQuote, setCurrentQuote] = useState<{ quote: string; author: string }>({ quote: '', author: '' });
  const [backgroundImage, setBackgroundImage] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(true);
  const [isReading, setIsReading] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  const categoryImages = useMemo(() => {
    return {
      motivational: PlaceHolderImages.filter(img => img.id.startsWith('motivational')),
      love: PlaceHolderImages.filter(img => img.id.startsWith('love')),
      life: PlaceHolderImages.filter(img => img.id.startsWith('life')),
      sad: PlaceHolderImages.filter(img => img.id.startsWith('sad')),
    };
  }, []);

  const selectRandomImage = (category: Category) => {
    const images = categoryImages[category];
    if (images.length > 0) {
      const randomIndex = Math.floor(Math.random() * images.length);
      setBackgroundImage(images[randomIndex].imageUrl);
    }
  };

  const handleGenerateQuote = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    if (audioRef.current) {
        audioRef.current.pause();
        setIsReading(false);
    }
    try {
      const result = await generateQuoteFromCategory({ category: selectedCategory });
      if (result.quote) {
        setCurrentQuote(parseQuote(result.quote));
      } else {
        throw new Error('No quote was generated.');
      }
    } catch (e) {
      console.error(e);
      toast({
        variant: 'destructive',
        title: 'Error generating quote',
        description: 'Could not generate a quote. Please try again later.',
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleCategoryChange = (value: string) => {
    const newCategory = value as Category;
    setSelectedCategory(newCategory);
    selectRandomImage(newCategory);
  };

  useEffect(() => {
    selectRandomImage(selectedCategory);
    handleGenerateQuote();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleReadAloud = async () => {
    if (!currentQuote.quote) return;

    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      setIsReading(false);
      return;
    }

    setIsReading(true);
    try {
      const result = await readQuoteAloud({ quote: currentQuote.quote });
      if (result.audioDataUri) {
        if (!audioRef.current) {
          audioRef.current = new Audio();
          audioRef.current.onended = () => setIsReading(false);
        }
        audioRef.current.src = result.audioDataUri;
        audioRef.current.play();
      }
    } catch (e) {
      console.error(e);
      toast({
        variant: 'destructive',
        title: 'Error reading quote',
        description: 'Text-to-speech failed. Please try again.',
      });
      setIsReading(false);
    }
  };

  const handleShare = async () => {
    const shareText = `"${currentQuote.quote}" - ${currentQuote.author}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'MyQuoter', text: shareText });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        toast({ title: 'Quote copied to clipboard!' });
      } catch (error) {
        console.error('Error copying:', error);
        toast({ variant: 'destructive', title: 'Could not copy quote.' });
      }
    }
  };

  return (
    <div className="relative w-full max-w-sm aspect-[9/16] overflow-hidden rounded-2xl shadow-2xl bg-card border">
      {backgroundImage && (
        <Image
          src={backgroundImage}
          alt="Inspirational background"
          fill
          priority
          className="object-cover transition-all duration-500 ease-in-out"
          data-ai-hint="background image"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
      
      <div className="absolute inset-0 flex flex-col p-6 text-white">
        <div className="flex-grow flex flex-col items-center justify-center text-center -mt-16">
          {isGenerating && !currentQuote.quote ? (
            <LoaderCircle className="h-12 w-12 animate-spin text-white" />
          ) : (
            <>
              <blockquote className="space-y-4">
                <p className="font-headline text-3xl font-bold text-shadow-lg transition-opacity duration-500">
                  &ldquo;{currentQuote.quote}&rdquo;
                </p>
                <footer className="text-right font-body text-lg font-light text-shadow">
                  &mdash; {currentQuote.author}
                </footer>
              </blockquote>
            </>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <div>
            <RadioGroup
              value={selectedCategory}
              onValueChange={handleCategoryChange}
              className="grid grid-cols-4 gap-2"
            >
              {categories.map(({ value, label, icon: Icon }) => (
                <div key={value}>
                  <RadioGroupItem value={value} id={value} className="sr-only" />
                  <Label
                    htmlFor={value}
                    className={cn(
                      'flex flex-col items-center justify-center gap-2 rounded-lg p-2 border-2 border-transparent cursor-pointer transition-all',
                      'bg-white/10 backdrop-blur-sm',
                      'hover:bg-white/20',
                      selectedCategory === value && 'border-white/80 bg-white/25'
                    )}
                  >
                    <Icon className="h-6 w-6" />
                    <span className="text-xs font-semibold">{label}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="flex items-center gap-4">
            <Button
              onClick={handleGenerateQuote}
              className="flex-grow h-14 text-lg font-bold bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg transform hover:scale-105 transition-transform"
              disabled={isGenerating}
            >
              {isGenerating ? (
                <LoaderCircle className="h-6 w-6 animate-spin" />
              ) : (
                'Generate New Quote'
              )}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-14 w-14 bg-white/10 hover:bg-white/20 backdrop-blur-sm"
              onClick={handleReadAloud}
              disabled={!currentQuote.quote || isGenerating}
              aria-label="Read quote aloud"
            >
              {isReading ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-14 w-14 bg-white/10 hover:bg-white/20 backdrop-blur-sm"
              onClick={handleShare}
              disabled={!currentQuote.quote || isGenerating}
              aria-label="Share quote"
            >
              <Share2 className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
