import { QuoteGenerator } from '@/components/quote-generator';

export default function Home() {
  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-background p-4 sm:p-6 md:p-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-6 top-1/2 -translate-y-1/2 transform text-sm font-semibold text-primary/50 opacity-80 [writing-mode:vertical-lr]"
      >
        prince kumar das
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-6 top-1/2 -translate-y-1/2 transform text-sm font-semibold text-accent/50 opacity-80 [writing-mode:vertical-rl] rotate-180"
      >
        jnv koderma
      </div>
      <QuoteGenerator />
    </main>
  );
}
