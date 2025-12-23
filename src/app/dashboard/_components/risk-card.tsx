'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Risk, RiskLevel } from '@/lib/data';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface RiskCardProps {
  risk: Risk;
}

const levelColorClasses: Record<RiskLevel, string> = {
    Low: 'bg-green-100 border-green-300 text-green-800',
    Medium: 'bg-yellow-100 border-yellow-300 text-yellow-800',
    High: 'bg-orange-100 border-orange-300 text-orange-800',
    Extreme: 'bg-red-100 border-red-300 text-red-800',
};

const levelTextClasses: Record<RiskLevel, string> = {
    Low: 'text-green-600',
    Medium: 'text-yellow-600',
    High: 'text-orange-600',
    Extreme: 'text-red-600',
};

export function RiskCard({ risk }: RiskCardProps) {
  const { name, level, explanation, Icon } = risk;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{name}</CardTitle>
        <Icon className={cn("h-4 w-4", levelTextClasses[level])} />
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
            <span className={cn("text-2xl font-bold", levelTextClasses[level])}>{level}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-2">{explanation}</p>
      </CardContent>
    </Card>
  );
}
