'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Bot } from 'lucide-react';

interface AdvisoryCardProps {
  location: string;
  advisory: string | null;
  isLoading: boolean;
}

export function AdvisoryCard({ location, advisory, isLoading }: AdvisoryCardProps) {
  return (
    <Card className="bg-primary/10 border-primary/40">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" />
            <span>Your AI-Powered Advisory for {location}</span>
        </CardTitle>
        <CardDescription>
            This guidance is generated based on your personal profile and real-time environmental data.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : (
          <p className="text-foreground/90">{advisory}</p>
        )}
      </CardContent>
    </Card>
  );
}
