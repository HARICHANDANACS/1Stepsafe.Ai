'use client';

import { createContext, useState, useEffect, ReactNode, useContext } from 'react';
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
}

export const DailyReportContext = createContext<DailyReportContextType>({
  report: null,
  isLoading: true,
  error: null,
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
  const [lastFetchedUserId, setLastFetchedUserId] = useState<string | null>(null);

  const userProfileRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: isProfileLoading } =
    useDoc<UserProfile>(userProfileRef);

  useEffect(() => {
    const isDataLoading = isUserLoading || isProfileLoading;
    if (isDataLoading) {
      setIsLoading(true);
      return;
    }
    
    // Guard against fetching if we're done loading but have no user.
    if (!user) {
      setIsLoading(false);
      return;
    }

    // Check if we need to fetch data.
    // This now correctly checks if the user has changed OR if we simply haven't fetched data yet for this session.
    const needsFetching = user.uid !== lastFetchedUserId;

    if (needsFetching && userProfile?.location?.lat && userProfile?.location?.lon) {
      const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        setLastFetchedUserId(user.uid); // Mark as fetching for this user

        try {
          const todayClimate = await getClimateDataForCity(userProfile.location.lat!, userProfile.location.lon!);
          const yesterdayClimate = await getYesterdayClimateData(userProfile.location.lat!, userProfile.location.lon!);

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
          setError(error.message || "Could not load daily health report. The API key may be missing, invalid, or you may have exceeded your usage quota.");
          setLastFetchedUserId(null); // Allow refetch on error
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
    } else if (!isDataLoading) {
      // Handles cases where fetching isn't needed or profile is incomplete.
      if (!userProfile?.location?.city) {
         setReport({ dailySummary: null, safetyAdvisory: null, dailyGuidance: null, userProfile: userProfile || null });
      }
      setIsLoading(false);
    }
  }, [user, isUserLoading, userProfile, isProfileLoading, firestore, lastFetchedUserId]);

  const contextValue = { report, isLoading, error };

  return (
    <DailyReportContext.Provider value={contextValue}>
      {children}
    </DailyReportContext.Provider>
  );
}
