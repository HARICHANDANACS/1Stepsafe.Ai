'use client';

import { createContext, useState, useEffect, ReactNode, useContext, useCallback } from 'react';
import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, collection } from 'firebase/firestore';
import type { UserProfile, DailyHealthReport, ExposureRecord } from '@/lib/data';
import { getClimateDataForCity, getYesterdayClimateData } from '@/lib/climate-service';
import { generateDailyHealthReport } from '@/ai/flows/generate-daily-health-report.flow';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';

interface DailyReportContextType {
  report: (DailyHealthReport & { userProfile: UserProfile | null }) | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export const DailyReportContext = createContext<DailyReportContextType>({
  report: null,
  isLoading: true,
  error: null,
  refetch: () => {},
});

export const useDailyReport = () => {
    const context = useContext(DailyReportContext);
    if (context === undefined) {
        throw new Error('useDailyReport must be used within a DailyReportProvider');
    }
    return context;
}

interface DailyReportProviderProps {
  children: ReactNode;
}

export function DailyReportProvider({ children }: DailyReportProviderProps) {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const [report, setReport] = useState<(DailyHealthReport & { userProfile: UserProfile | null }) | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userProfileRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: isProfileLoading } =
    useDoc<UserProfile>(userProfileRef);
  
  const fetchData = useCallback(async () => {
    if (!user || !userProfile || !userProfile.location?.lat || !userProfile.location?.lon) {
      if (!isUserLoading && !isProfileLoading) {
        setIsLoading(false);
      }
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const todayClimate = await getClimateDataForCity(userProfile.location.lat, userProfile.location.lon);
      const yesterdayClimate = await getYesterdayClimateData(userProfile.location.lat, userProfile.location.lon);
      
      const fullReport = await generateDailyHealthReport({
        userProfile,
        todayClimate,
        yesterdayClimate
      });
      
      setReport({ ...fullReport, userProfile });
      
      if (user && fullReport.dailySummary) {
        const historyRef = collection(firestore, 'users', user.uid, 'exposureHistory');
        const today = new Date().toISOString().split('T')[0];
        const record: ExposureRecord = {
          date: today,
          personalHealthRiskScore: fullReport.dailySummary.personalHealthRiskScore,
          maxHeat: todayClimate.temperature,
          maxAqi: todayClimate.aqi,
          maxUv: todayClimate.uvIndex,
        };
        addDocumentNonBlocking(historyRef, record);
      }
      
    } catch (error: any) {
      console.error("Error generating daily health report:", error);
      setError(error.message || "Could not load daily health report.");
      setReport(null);
    } finally {
      setIsLoading(false);
    }
  }, [user, userProfile, firestore, isUserLoading, isProfileLoading]);

  useEffect(() => {
    const isDataLoading = isUserLoading || isProfileLoading;

    if (isDataLoading) {
      setIsLoading(true);
      return;
    }

    if (!user) {
      setIsLoading(false);
      setReport(null);
      return;
    }
    
    if (userProfile && userProfile.location?.city) {
       if (!report || report.userProfile?.id !== userProfile.id) {
         fetchData();
       } else {
        setIsLoading(false);
       }
    } else {
      setIsLoading(false);
      setReport({ dailySummary: null, safetyAdvisory: null, dailyGuidance: null, userProfile: userProfile || null });
    }

  }, [user, isUserLoading, userProfile, isProfileLoading, fetchData, report]);

  const refetch = useCallback(() => {
    setReport(null);
    fetchData();
  }, [fetchData]);

  const contextValue = { report, isLoading, error, refetch };

  return (
    <DailyReportContext.Provider value={contextValue}>
      {children}
    </DailyReportContext.Provider>
  );
}
