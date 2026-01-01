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

  const userProfileRef = useMemoFirebase(() => {
    if (!user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: userProfile, isLoading: isProfileLoading } =
    useDoc<UserProfile>(userProfileRef);

  useEffect(() => {
    // Don't fetch until we have a user profile with location
    if (isUserLoading || isProfileLoading) {
      if (!report && !error) {
        setIsLoading(true);
      }
      return;
    }

    if (userProfile?.location?.lat && userProfile?.location?.lon) {
      const fetchData = async () => {
        setIsLoading(true);
        setError(null);

        try {
          const todayClimate = await getClimateDataForCity(userProfile.location.lat!, userProfile.location.lon!);
          const yesterdayClimate = await getYesterdayClimateData(userProfile.location.lat!, userProfile.location.lon!);

          const fullReport = await generateDailyHealthReport({
            userProfile,
            todayClimate,
            yesterdayClimate
          });
          
          setReport({ ...fullReport, userProfile });

          // After getting the summary, save the exposure record
          if (user && fullReport.dailySummary) {
            const historyRef = collection(firestore, 'users', user.uid, 'exposureHistory');
            const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
            const record: ExposureRecord = {
              date: today,
              personalHealthRiskScore: fullReport.dailySummary.personalHealthRiskScore,
              maxHeat: todayClimate.temperature,
              maxAqi: todayClimate.aqi,
              maxUv: todayClimate.uvIndex,
            };
            // This is a non-blocking write
            addDocumentNonBlocking(historyRef, record);
          }

        } catch (error: any) {
          console.error("Error generating daily health report:", error);
          setError(error.message || "Could not load daily health report. The API key may be missing, invalid, or you may have exceeded your usage quota.");
        } finally {
          setIsLoading(false);
        }
      };

      // Only fetch if we don't have a report yet for the current user profile
      if (!report || report.userProfile?.id !== userProfile.id) {
          fetchData();
      } else {
         setIsLoading(false);
      }
      
    } else if (!isProfileLoading && !isUserLoading) {
      // If we're done loading but have no profile/location, stop loading and show profile completion message.
      setReport({ dailySummary: null, safetyAdvisory: null, dailyGuidance: null, userProfile: userProfile || null });
      setIsLoading(false);
    }
  }, [userProfile, isProfileLoading, user, firestore, isUserLoading]);

  const contextValue = { report, isLoading, error };

  return (
    <DailyReportContext.Provider value={contextValue}>
      {children}
    </DailyReportContext.Provider>
  );
}
