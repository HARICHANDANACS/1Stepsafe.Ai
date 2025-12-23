
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, ShieldCheck } from "lucide-react";
import { generateConciseSafetyAdvisory } from "@/ai/flows/generate-concise-safety-advisory.flow";
import type { RiskProfile } from "@/lib/data";

type AdvisoryStepProps = {
  riskProfile: RiskProfile;
};

export function AdvisoryStep({ riskProfile }: AdvisoryStepProps) {
  const [advisory, setAdvisory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function getAdvisory() {
      try {
        setIsLoading(true);
        setError(null);
        const input = {
          heatRisk: riskProfile.heatRisk.level,
          uvRisk: riskProfile.uvRisk.level,
          aqiRisk: riskProfile.aqiRisk.level,
          humidityDiscomfort: riskProfile.humidityDiscomfort.level,
          rainExposure: riskProfile.rainExposure.level,
        };
        const result = await generateConciseSafetyAdvisory(input);
        setAdvisory(result.advisory);
      } catch (err) {
        console.error("Error generating advisory:", err);
        setError("Could not generate the AI summary. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    }

    getAdvisory();
  }, [riskProfile]);

  return (
    <Card className="bg-secondary/50">
      <CardHeader className="flex-row items-center gap-3 space-y-0">
        <ShieldCheck className="w-8 h-8 text-primary" />
        <CardTitle>Your AI-Powered Safety Advisory</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[75%]" />
          </div>
        )}
        {error && (
          <div className="flex items-center gap-3 text-destructive">
            <AlertCircle className="w-5 h-5" />
            <p>{error}</p>
          </div>
        )}
        {advisory && (
          <p className="text-base text-foreground/90 whitespace-pre-wrap">
            {advisory}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
