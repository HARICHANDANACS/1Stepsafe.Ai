'use client';

import { createContext, useState, useEffect, ReactNode, useContext, useCallback } from 'react';
import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, collection } from 'firebase/firestore';
import type { UserProfile, DailyHealthReport, ExposureRecord } from '@/lib/data';
import { getClimateDataForCity, getYesterdayClimateData } from '@/lib/climate-service';
import { generateSyntheticDailyHealthReport } from '@/lib/synthetic-data-service';
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
      // ** Using Synthetic Data Generation instead of AI flow **
      const fullReport = generateSyntheticDailyHealthReport(profile);
      
      setReport({ ...fullReport, userProfile: profile });
      sessionStorage.setItem(`reportFetched_${user.uid}`, 'true');
      
      // Still log exposure history based on synthetic data for now
      if (fullReport.dailySummary) {
        const historyRef = collection(firestore, 'users', user.uid, 'exposureHistory');
        const today = new Date().toISOString().split('T')[0];
        const record: ExposureRecord = {
          date: today,
          personalHealthRiskScore: fullReport.dailySummary.personalHealthRiskScore,
          // Using placeholder values as we are not fetching real climate data
          maxHeat: 75 + Math.round(Math.random() * 10), 
          maxAqi: 50 + Math.round(Math.random() * 20),
          maxUv: 5 + Math.round(Math.random() * 2),
        };
        addDocumentNonBlocking(historyRef, record);
      }
      
    } catch (error: any) {
      console.error("Error generating synthetic daily health report:", error);
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
        const alreadyFetched = sessionStorage.getItem(`reportFetched_${user.uid}`);
        if (!alreadyFetched) {
            fetchData(userProfile);
        } else {
             if (isLoading) {
                setIsLoading(false);
             }
        }
    } else if (userProfile) { 
        setIsLoading(false);
        setReport({ dailySummary: null, safetyAdvisory: null, dailyGuidance: null, userProfile });
    } else if (!userProfile && !isProfileLoading) {
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
