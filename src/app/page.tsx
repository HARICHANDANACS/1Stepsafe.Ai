import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { StepSafeLogo } from '@/components/icons';
import { MoveRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <StepSafeLogo className="h-8 w-auto" />
      </header>
      <main className="flex-grow flex items-center">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground">
              StepSafe AI
            </h1>
            <p className="mt-4 text-lg md:text-xl text-muted-foreground">
              Your Personal Climate-Health Co-pilot.
            </p>
            <p className="mt-6 max-w-2xl mx-auto text-base md:text-lg text-foreground/80">
              Personalized outdoor safety guidance based on your routine, your health, and real-time environmental data. Make every step outside a safer one.
            </p>
            <div className="mt-10">
              <Button asChild size="lg" className="font-bold text-lg">
                <Link href="/dashboard">
                  View My Dashboard
                  <MoveRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
      <footer className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <p className="text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} StepSafe AI. All Rights Reserved.
        </p>
      </footer>
    </div>
  );
}
