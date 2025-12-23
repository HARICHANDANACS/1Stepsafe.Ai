'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { CheckCircle2, XCircle } from 'lucide-react';

interface SafeUnsafeTimeWindowsProps {
  safeWindows: {
    start: string;
    end: string;
    isSafe: boolean;
  }[];
}

export function SafeUnsafeTimeWindows({ safeWindows }: SafeUnsafeTimeWindowsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Safe & Unsafe Time Windows</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {safeWindows.map((window, index) => (
            <div key={index} className="flex items-center">
              <div className="flex-none w-28 text-sm text-muted-foreground">
                {window.start} - {window.end}
              </div>
              <div className="flex-grow flex items-center gap-2 ml-4">
                <div
                  className={cn('h-4 w-4 rounded-full', {
                    'bg-green-500': window.isSafe,
                    'bg-red-500': !window.isSafe,
                  })}
                />
                <span className="text-sm font-medium">
                  {window.isSafe ? 'Safer to be outdoors' : 'Avoid outdoors if possible'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
