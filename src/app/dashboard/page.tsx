'use client';

import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { UserProfile, DailySummary } from '@/lib/data';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { ArrowRight, Info } from 'lucide-react';
import { getClimateDataForCity, getYesterdayClimateData } from '@/lib/climate-service';
import { generateDailySummary } from '@/ai/flows/generate-daily-summary.flow';
import { generateConciseSafetyAdvisory } from '@/ai/flows/generate-concise-safety-advisory.flow';
import { Skeleton } from '@/components/ui/skeleton';
import { SafeUnsafeTimeWindows } from './_components/safe-unsafe-time-windows';
import { WhatChangedToday } from './_components/what-changed-today';
import { PersonalHealthRiskScore } from './_components/personal-health-risk-score';
import toast from 'react-hot-toast';


export default function DashboardOverviewPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const [dailySummary, setDailySummary] = useState<DailySummary | null>(null);
  const [safetyAdvisory, setSafetyAdvisory] = useState<string | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(true);

  const userProfileRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: isProfileLoading } =
    useDoc<UserProfile>(userProfileRef);

  useEffect(() => {
    if (userProfile && userProfile.name) {
      toast.success(`Welcome back, ${userProfile.name}!`);
    }
  }, [userProfile]);

  useEffect(() => {
    if (userProfile && userProfile.location) {
      const fetchData = async () => {
        setIsDataLoading(true);

        const todayClimate = getClimateDataForCity(userProfile.location.city);
        const yesterdayClimate = getYesterdayClimateData(userProfile.location.city);

        try {
          // Generate both summary and advisory in parallel
          const [summaryResult, advisoryResult] = await Promise.all([
            generateDailySummary({
              userProfile,
              todayClimate,
              yesterdayClimate
            }),
            generateConciseSafetyAdvisory({ climateData: todayClimate })
          ]);
          
          setDailySummary(summaryResult);
          setSafetyAdvisory(advisoryResult.advisory);

        } catch (error) {
          console.error("Error generating daily data:", error);
        } finally {
          setIsDataLoading(false);
        }
      };

      fetchData();
    } else if (!isProfileLoading && !userProfile) {
      setIsDataLoading(false);
    }
  }, [userProfile, isProfileLoading]);

  const isLoading = isUserLoading || isProfileLoading || isDataLoading;

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-5 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-4">
             <Skeleton className="h-20 w-full" />
             <Skeleton className="h-10 w-full" />
          </CardContent>
          <CardFooter>
             <Skeleton className="h-10 w-48" />
          </CardFooter>
        </Card>
        <Card>
           <CardHeader>
              <Skeleton className="h-8 w-full" />
           </CardHeader>
           <CardContent>
              <Skeleton className="h-32 w-full" />
           </CardContent>
        </Card>
      </div>
    );
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

  if (!dailySummary) {
    return (
        <Card className="text-center p-8">
            <h2 className="text-xl font-semibold mb-2">Could not generate summary</h2>
            <p className="text-muted-foreground">There was an issue generating your daily climate-health summary. Please try again later.</p>
        </Card>
    )
  }

  return (
    <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
            <Card className="sm:col-span-2">
                <CardHeader className="pb-3">
                    <CardTitle>Your Daily Health Dashboard</CardTitle>
                    <CardDescription className="max-w-lg text-balance leading-relaxed">
                        {dailySummary.quickInsight}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {safetyAdvisory && (
                        <div className="p-4 bg-accent/50 border border-accent rounded-lg">
                            <p className="text-sm text-accent-foreground/90">{safetyAdvisory}</p>
                        </div>
                    )}
                </CardContent>
                <CardFooter>
                    <Button asChild>
                        <Link href="/dashboard/guidance">View Today's Guidance <ArrowRight className="ml-2 h-4 w-4" /></Link>
                    </Button>
                </CardFooter>
            </Card>
            <PersonalHealthRiskScore score={dailySummary.personalHealthRiskScore} />
            <WhatChangedToday 
              tempChange={dailySummary.whatChanged.tempChange}
              aqiChange={dailySummary.whatChanged.aqiChange}
            />
        </div>
        <SafeUnsafeTimeWindows safeWindows={dailySummary.safeWindows} />
  </div>
  );
}
