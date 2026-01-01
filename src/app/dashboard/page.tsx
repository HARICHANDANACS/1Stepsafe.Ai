'use client';

import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, collection } from 'firebase/firestore';
import type { UserProfile, DailySummary, ExposureRecord } from '@/lib/data';
import { useEffect, useState, useContext } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { ArrowRight, Info } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { SafeUnsafeTimeWindows } from './_components/safe-unsafe-time-windows';
import { WhatChangedToday } from './_components/what-changed-today';
import { PersonalHealthRiskScore } from './_components/personal-health-risk-score';
import toast from 'react-hot-toast';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { DailyReportContext } from './daily-report-provider';

export default function DashboardOverviewPage() {
  const { user } = useUser();
  const { report, isLoading, error } = useContext(DailyReportContext);
  const dailySummary = report?.dailySummary;
  const safetyAdvisory = report?.safetyAdvisory?.advisory;

  useEffect(() => {
    if (user && report?.userProfile?.name) {
      const welcomed = sessionStorage.getItem('welcomed');
      if (!welcomed) {
        toast.success(`Welcome back, ${report.userProfile.name}!`);
        sessionStorage.setItem('welcomed', 'true');
      }
    }
  }, [user, report]);

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

  if (report && !report.userProfile?.location?.city) {
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

  if (error || !dailySummary) {
    return (
        <Card className="text-center p-8">
            <h2 className="text-xl font-semibold mb-2">Could not generate summary</h2>
            <p className="text-muted-foreground">{error || "There was an issue generating your daily climate-health summary. Please try again later."}</p>
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
