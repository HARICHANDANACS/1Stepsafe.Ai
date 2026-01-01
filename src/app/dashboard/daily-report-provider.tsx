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
  
  const fetchData = useCallback(async (profile: UserProfile) => {
    if (!profile.location?.lat || !profile.location?.lon || !user?.uid) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const todayClimate = await getClimateDataForCity(profile.location.lat, profile.location.lon);
      const yesterdayClimate = await getYesterdayClimateData(profile.location.lat, profile.location.lon);
      
      const fullReport = await generateDailyHealthReport({
        userProfile: profile,
        todayClimate,
        yesterdayClimate
      });
      
      setReport({ ...fullReport, userProfile: profile });
      sessionStorage.setItem(`reportFetched_${user.uid}`, 'true');
      
      if (fullReport.dailySummary) {
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
  }, [user, firestore]);

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
        // This is the critical guard to prevent re-fetching in an infinite loop.
        const alreadyFetched = sessionStorage.getItem(`reportFetched_${user.uid}`);
        if (!alreadyFetched) {
            fetchData(userProfile);
        } else {
             // If data was already fetched, just ensure loading is false.
             // This prevents the loading skeleton from showing on every navigation.
             if (isLoading) {
                setIsLoading(false);
             }
        }
    } else if (userProfile) { // Profile exists but is incomplete
        setIsLoading(false);
        // Set a partial report so the UI can prompt the user to complete their profile.
        setReport({ dailySummary: null, safetyAdvisory: null, dailyGuidance: null, userProfile });
    } else if (!userProfile && !isProfileLoading) {
        // The profile document doesn't exist for this user yet.
        setIsLoading(false);
        setReport(null);
    }

  }, [user, userProfile, isUserLoading, isProfileLoading, fetchData, isLoading]);


  const refetch = useCallback(() => {
    if (user?.uid) {
        sessionStorage.removeItem(`reportFetched_${user.uid}`);
    }
    setReport(null); // Clear old report
    if (userProfile) {
        fetchData(userProfile);
    }
  }, [fetchData, userProfile, user?.uid]);

  const contextValue = { report, isLoading, error, refetch };

  return (
    <DailyReportContext.Provider value={contextValue}>
      {children}
    </DailyReportContext.Provider>
  );
}
