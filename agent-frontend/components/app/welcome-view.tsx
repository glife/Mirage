import React from 'react';
import { Button } from '@/components/livekit/button';
import { Microphone } from '@phosphor-icons/react/dist/ssr';

function WelcomeImage() {
  return (
    <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-primary animate-pulse">
      <Microphone weight="fill" className="h-12 w-12" />
    </div>
  );
}

interface WelcomeViewProps {
  startButtonText: string;
  onStartCall: () => void;
}

export const WelcomeView = ({
  startButtonText,
  onStartCall,
  ref,
}: React.ComponentProps<'div'> & WelcomeViewProps) => {
  return (
    <div ref={ref} className="flex h-full items-center justify-center bg-transparent">
      <section className="flex flex-col items-center justify-center text-center">
        <WelcomeImage />

        <p className="text-foreground max-w-prose pt-1 text-xl font-medium leading-relaxed tracking-tight">
          Ready to start?
        </p>

        <Button
          variant="primary"
          size="lg"
          onClick={onStartCall}
          className="mt-8 min-w-[200px] rounded-full px-8 py-6 text-lg font-medium shadow-lg transition-all hover:scale-105 active:scale-95"
        >
          {startButtonText}
        </Button>
      </section>
    </div>
  );
};
