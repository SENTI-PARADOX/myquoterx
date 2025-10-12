"use client";

import { useState, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import { generateQuoteFromCategory } from '@/ai/flows/generate-quote-from-category';
import type { GenerateQuoteFromCategoryInput } from '@/ai/flows/generate-quote-from-category';
import { generateQuotePack } from '@/ai/flows/generate-quote-pack';
import { readQuoteAloud } from '@/ai/flows/read-quote-aloud';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import jsPDF from 'jspdf';
import { Heart, LoaderCircle, Route, Share2, Sunrise, Droplets, Volume2, VolumeX, Download } from 'lucide-react';

type Category = GenerateQuoteFromCategoryInput['category'];

const categories: { value: Category; label: string; icon: React.ElementType }[] = [
  { value: 'motivational', label: 'Motivational', icon: Sunrise },
  { value: 'love', label: 'Love', icon: Heart },
  { value: 'life', label: 'Life', icon: Route },
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
  const [currentQuote, setCurrentQuote] = useState<{ quote: string; author: string }>({ 
    quote: 'The only way to do great work is to love what you do.', 
    author: 'Steve Jobs' 
  });
  const [backgroundImage, setBackgroundImage] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(true);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isReading, setIsReading] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioSrc, setAudioSrc] = useState<string>('');
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
  
  const handleGenerateQuote = async (category: Category = selectedCategory) => {
    setIsGenerating(true);
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsReading(false);
    setIsPlaying(false);
    setAudioSrc('');

    try {
      selectRandomImage(category);
      const result = await generateQuoteFromCategory({ category });
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
    handleGenerateQuote(newCategory);
  };
  
  useEffect(() => {
    handleGenerateQuote('motivational');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!audioRef.current) {
        audioRef.current = new Audio();
        audioRef.current.addEventListener('ended', () => setIsPlaying(false));
        audioRef.current.addEventListener('pause', () => setIsPlaying(false));
        audioRef.current.addEventListener('play', () => setIsPlaying(true));
    }

    return () => {
        if (audioRef.current) {
            audioRef.current.removeEventListener('ended', () => setIsPlaying(false));
            audioRef.current.removeEventListener('pause', () => setIsPlaying(false));
            audioRef.current.removeEventListener('play', () => setIsPlaying(true));
        }
    }
  }, []);


  const handleReadAloud = async () => {
    if (!currentQuote.quote || !audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      return;
    }
    
    if (audioSrc) {
        audioRef.current.play();
        return;
    }

    setIsReading(true);
    try {
      const result = await readQuoteAloud({ quote: currentQuote.quote });
      if (result.audioDataUri) {
        setAudioSrc(result.audioDataUri);
        audioRef.current.src = result.audioDataUri;
        audioRef.current.play();
      } else {
        setIsReading(false);
      }
    } catch (e) {
      console.error(e);
      toast({
        variant: 'destructive',
        title: 'Error reading quote',
        description: 'Text-to-speech failed. Please try again.',
      });
    } finally {
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

  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    toast({ title: 'Generating PDF...', description: 'This may take a moment.' });
    try {
      const doc = new jsPDF();
      
      // Title Page
      doc.setFontSize(24);
      doc.text("Mega Quotes Pack", 105, 20, { align: 'center' });
      doc.setFontSize(12);
      doc.text("Thousands of inspirational quotes organized by theme.", 105, 30, { align: 'center' });
      
      let isFirstCategory = true;

      for (const cat of categories) {
        if (!isFirstCategory) {
          doc.addPage();
        }
        isFirstCategory = false;

        let yPos = 20;

        doc.setFontSize(18);
        doc.text(`${cat.label} Quotes`, 20, yPos);
        yPos += 15;
        
        const result = await generateQuotePack({ category: cat.value, count: 1000 });
        doc.setFontSize(10);

        result.quotes.forEach((quote, index) => {
           if (yPos > 280) {
              doc.addPage();
              yPos = 20;
           }
           const { quote: qText, author } = parseQuote(quote);
           const wrappedText = doc.splitTextToSize(`${index + 1}. "${qText}" - ${author}`, 170);
           doc.text(wrappedText, 25, yPos);
           yPos += (wrappedText.length * 5) + 5;
        });
      }

      doc.save("Mega_Quotes_Pack.pdf");

    } catch (error) {
       console.error("Failed to generate PDF", error);
       toast({
         variant: "destructive",
         title: "PDF Generation Failed",
         description: "Could not generate the quote pack PDF. Please try again.",
       });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="relative w-full max-w-sm aspect-[9/16] overflow-hidden rounded-2xl shadow-2xl bg-card border flex flex-col justify-end">
      {backgroundImage ? (
        <Image
          src={backgroundImage}
          alt="Inspirational background"
          fill
          priority
          className="object-cover transition-all duration-500 ease-in-out"
          data-ai-hint="background image"
        />
      ) : (
        <div className="w-full h-full bg-secondary animate-pulse" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
      
      <div className="relative z-10 flex flex-col gap-6 p-6 text-white">
        <div className="flex-grow flex flex-col items-center justify-center text-center mb-16 min-h-[200px]">
          {isGenerating ? (
            <LoaderCircle className="h-12 w-12 animate-spin text-white" />
          ) : (
            <blockquote className="space-y-4">
              <p className="font-headline text-3xl font-bold text-shadow-lg">
                &ldquo;{currentQuote.quote}&rdquo;
              </p>
              <footer className="text-right font-body text-lg font-light text-shadow">
                &mdash; {currentQuote.author}
              </footer>
            </blockquote>
          )}
        </div>

        <div>
          <RadioGroup
            value={selectedCategory}
            onValueChange={handleCategoryChange}
            className="grid grid-cols-4 gap-2"
            disabled={isGenerating || isDownloading}
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
                    selectedCategory === value && 'border-white/80 bg-white/25',
                    'data-[disabled]:opacity-50 data-[disabled]:pointer-events-none'
                  )}
                >
                  <Icon className="h-6 w-6" />
                  <span className="text-xs font-semibold">{label}</span>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => handleGenerateQuote()}
            className="flex-grow h-14 text-lg font-bold bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg transform hover:scale-105 transition-transform"
            disabled={isGenerating || isDownloading}
          >
            {isGenerating ? (
              <LoaderCircle className="h-6 w-6 animate-spin" />
            ) : (
              'New Quote'
            )}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-14 w-14 bg-white/10 hover:bg-white/20 backdrop-blur-sm"
            onClick={handleReadAloud}
            disabled={isGenerating || isDownloading || isReading || (!currentQuote.quote)}
            aria-label="Read quote aloud"
          >
            {isReading ? <LoaderCircle className="h-6 w-6 animate-spin" /> : (isPlaying ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />)}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-14 w-14 bg-white/10 hover:bg-white/20 backdrop-blur-sm"
            onClick={handleShare}
            disabled={isGenerating || isDownloading}
            aria-label="Share quote"
          >
            <Share2 className="h-6 w-6" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-14 w-14 bg-white/10 hover:bg-white/20 backdrop-blur-sm"
            onClick={handleDownloadPdf}
            disabled={isDownloading}
            aria-label="Download quotes pack"
          >
            {isDownloading ? (
              <LoaderCircle className="h-6 w-6 animate-spin" />
            ) : (
              <Download className="h-6 w-6" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
