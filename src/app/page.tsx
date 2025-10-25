import { QuoteGenerator } from '@/components/quote-generator';

export default function Home() {
  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-background p-4 sm:p-6 md:p-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-6 top-1/2 -translate-y-1/2 transform font-stylish text-2xl font-semibold text-primary/70 opacity-80 [writing-mode:vertical-lr]"
      >
        prince kumar das
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-6 top-1/2 -translate-y-1/2 transform font-stylish text-2xl font-semibold text-accent/70 opacity-80 [writing-mode:vertical-rl] rotate-180"
      >
        jnv koderma
      </div>
      <QuoteGenerator />
      <div className="text-center mt-8">
        <h2 className="font-stylish text-4xl font-bold text-primary">THE PRINCE</h2>
        <p className="font-stylish text-2xl text-accent">THE BOY OF JNV KODERMA</p>
      </div>
    </main>
  );
}
