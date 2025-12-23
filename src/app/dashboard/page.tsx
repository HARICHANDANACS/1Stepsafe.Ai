'use client';

import { Header } from '@/components/layout/header';
import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { UserProfile, ClimateData, RiskProfile } from '@/lib/data';
import { useEffect, useState } from 'react';
import { getClimateDataForCity } from '@/lib/climate-service';
import { analyzeRisks } from '@/lib/risk-engine';
import { generateConciseSafetyAdvisory, GenerateConciseSafetyAdvisoryInput } from '@/ai/flows/generate-concise-safety-advisory.flow';
import { RiskCard } from './_components/risk-card';
import { AdvisoryCard } from './_components/advisory-card';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const MOCK_DELAY_MS = 800; // Simulate network latency

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const [climateData, setClimateData] = useState<ClimateData | null>(null);
  const [riskProfile, setRiskProfile] = useState<RiskProfile | null>(null);
  const [advisory, setAdvisory] = useState<string | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(true);

  const userProfileRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: isProfileLoading } =
    useDoc<UserProfile>(userProfileRef);

  useEffect(() => {
    if (userProfile && userProfile.location) {
      const fetchData = async () => {
        setIsDataLoading(true);
        setAdvisory(null); // Clear old advisory

        // Simulate fetching data
        await new Promise(resolve => setTimeout(resolve, MOCK_DELAY_MS));

        const climate = getClimateDataForCity(userProfile.location.city);
        setClimateData(climate);

        const risks = analyzeRisks(climate);
        setRiskProfile(risks);

        // Prepare input for the AI flow
        const advisoryInput: GenerateConciseSafetyAdvisoryInput = {
            heatRisk: risks.heatRisk.level,
            uvRisk: risks.uvRisk.level,
            aqiRisk: risks.aqiRisk.level,
            humidityDiscomfort: risks.humidityDiscomfort.level,
            rainExposure: risks.rainExposure.level,
        };

        // Generate the advisory
        try {
            const result = await generateConciseSafetyAdvisory(advisoryInput);
            setAdvisory(result.advisory);
        } catch (error) {
            console.error("Error generating advisory:", error);
            setAdvisory("Could not generate an advisory at this time. Please check your connection.");
        }


        setIsDataLoading(false);
      };

      fetchData();
    } else if (!isProfileLoading && !userProfile) {
      // If profile loading is finished and there's no profile
      setIsDataLoading(false);
    }
  }, [userProfile, isProfileLoading]);

  const isLoading = isUserLoading || isProfileLoading || isDataLoading;

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-6">
          <Card className="p-6">
            <Skeleton className="h-8 w-1/2 mb-4" />
            <Skeleton className="h-6 w-3/4" />
          </Card>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Skeleton className="h-40 rounded-lg" />
            <Skeleton className="h-40 rounded-lg" />
            <Skeleton className="h-40 rounded-lg" />
            <Skeleton className="h-40 rounded-lg" />
            <Skeleton className="h-40 rounded-lg" />
          </div>
        </div>
      );
    }

    if (!user) {
      return <p>Please log in to see your dashboard.</p>;
    }

    if (!userProfile?.location?.city) {
      return (
         <Card className="text-center p-8">
            <h2 className="text-xl font-semibold mb-2">Welcome to StepSafe AI!</h2>
            <p className="text-muted-foreground mb-6">
               To get your personalized climate-health advisory, please complete your profile.
            </p>
            <Button asChild>
               <Link href="/dashboard/profile">
                  Complete Your Profile
               </Link>
            </Button>
         </Card>
      );
    }

    return (
      <div className="space-y-6">
        <AdvisoryCard
          location={userProfile.location.city}
          advisory={advisory}
          isLoading={!advisory}
        />
        {riskProfile && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <RiskCard risk={riskProfile.heatRisk} />
            <RiskCard risk={riskProfile.uvRisk} />
            <RiskCard risk={riskProfile.aqiRisk} />
            <RiskCard risk={riskProfile.humidityDiscomfort} />
            <RiskCard risk={riskProfile.rainExposure} />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
