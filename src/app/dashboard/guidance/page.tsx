'use client';

import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { UserProfile, DailyGuidance, RiskLevel } from '@/lib/data';
import { useEffect, useState } from 'react';
import { getClimateDataForCity } from '@/lib/climate-service';
import { generateLifePhaseGuidance } from '@/ai/flows/generate-life-phase-guidance.flow';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Skeleton } from '@/components/ui/skeleton';
import { Thermometer, Sun, Wind, Cloud, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const RiskIndicator = ({ level, name }: { level: RiskLevel, name: string }) => {
    const riskColor = {
        Low: 'bg-green-500',
        Medium: 'bg-yellow-500',
        High: 'bg-orange-500',
        Extreme: 'bg-red-500',
    }[level];

    const Icon = {
        'Heat Risk': Thermometer,
        'UV Risk': Sun,
        'Air Quality (AQI)': Wind,
        'Rain Exposure': Cloud,
    }[name] || Sun;

    return (
        <div className="flex items-center gap-2">
            <div className={cn("w-3 h-3 rounded-full", riskColor)} />
            <Icon className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">{name}: {level}</span>
        </div>
    )
}

const LoadingSkeleton = () => (
    <Card>
        <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-5 w-1/2" />
        </CardHeader>
        <CardContent className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
        </CardContent>
    </Card>
)

export default function GuidancePage() {
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    const [dailyGuidance, setDailyGuidance] = useState<DailyGuidance | null>(null);
    const [isDataLoading, setIsDataLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const userProfileRef = useMemoFirebase(() => {
        if (!user) return null;
        return doc(firestore, 'users', user.uid);
    }, [firestore, user]);

    const { data: userProfile, isLoading: isProfileLoading } =
        useDoc<UserProfile>(userProfileRef);

    useEffect(() => {
        if (userProfile?.location?.lat && userProfile?.location?.lon) {
            const fetchData = async () => {
                setIsDataLoading(true);
                setError(null);

                try {
                    const climateData = await getClimateDataForCity(userProfile.location.lat!, userProfile.location.lon!);

                    const result = await generateLifePhaseGuidance({
                        userProfile,
                        climateData,
                    });
                    setDailyGuidance(result);
                } catch (error: any) {
                    console.error("Error generating daily guidance:", error);
                    setError(error.message || "Could not generate guidance. The API key might be missing or invalid.");
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
        return <LoadingSkeleton />;
    }
    
    if (error || !dailyGuidance) {
         return (
            <Card className="text-center p-8">
                <h2 className="text-xl font-semibold mb-2">Could not generate guidance</h2>
                <p className="text-muted-foreground">{error || "There was an issue generating your detailed daily guidance. Please try again later."}</p>
            </Card>
        )
    }

    return (
        <div className="grid gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Your Detailed Daily Guidance</CardTitle>
                    <CardDescription>
                        Personalized advice for each phase of your day, based on your routine and today&apos;s climate conditions.
                    </CardDescription>
                </CardHeader>
            </Card>
             <Accordion type="single" collapsible defaultValue="item-0" className="w-full">
                {dailyGuidance.phases.map((phase, index) => (
                    <AccordionItem value={`item-${index}`} key={index}>
                        <AccordionTrigger className="text-lg font-medium hover:no-underline">
                            <div className="flex flex-col text-left">
                                <span>{phase.phase}</span>
                                <span className="text-sm font-normal text-muted-foreground">{phase.startTime} - {phase.endTime}</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-2">
                           <Card className="border-none shadow-none">
                                <CardContent className="p-0">
                                    <p className="text-base text-foreground mb-6">{phase.summary}</p>
                                    
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <h4 className="font-semibold">Key Risks</h4>
                                            <div className="grid grid-cols-2 gap-3">
                                                <RiskIndicator name="Heat Risk" level={phase.risks.heatRisk} />
                                                <RiskIndicator name="UV Risk" level={phase.risks.uvRisk} />
                                                <RiskIndicator name="Air Quality (AQI)" level={phase.risks.aqiRisk} />
                                                <RiskIndicator name="Rain Exposure" level={phase.risks.rainExposure} />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                             <h4 className="font-semibold">Recommendations</h4>
                                             <ul className="space-y-2">
                                                {phase.recommendations.map((rec, i) => (
                                                    <li key={i} className="flex items-center gap-3">
                                                        <div className="bg-green-100 dark:bg-green-900 p-1 rounded-full">
                                                            <Check className="w-4 h-4 text-green-600 dark:text-green-300" />
                                                        </div>
                                                        <span className="text-sm">{rec}</span>
                                                    </li>
                                                ))}
                                             </ul>
                                        </div>
                                    </div>

                                </CardContent>
                           </Card>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    );
}
