'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { StepWrapper } from '@/components/steps/step-wrapper';
import { LocationStep } from '@/components/steps/location-step';
import { DashboardStep } from '@/components/steps/dashboard-step';
import { ChecklistStep } from '@/components/steps/checklist-step';
import { TimeWindowsStep } from '@/components/steps/time-windows-step';
import { AdvisoryStep } from '@/components/steps/advisory-step';
import { analyzeRisks } from '@/lib/risk-engine';
import type { UserInput, ClimateData, RiskProfile } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const TOTAL_STEPS = 5;

// Mock API functions
async function fetchClimateData(city: string): Promise<ClimateData> {
  // In a real app, this would be an API call.
  // We simulate a network delay.
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Return mock data based on a simple hash of the city name
  // to provide some variation for demonstration.
  const hash = city.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  return {
    temperature: 70 + (hash % 35), // 70-104 F
    humidity: 40 + (hash % 50), // 40-89 %
    uvIndex: 1 + (hash % 11), // 1-11
    aqi: 10 + (hash % 250), // 10-259
    rainProbability: hash % 100, // 0-99 %
  };
}

export default function CheckPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [userInput, setUserInput] = useState<UserInput | null>(null);
  const [riskProfile, setRiskProfile] = useState<RiskProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm(); // Form is managed within LocationStep, but we need to trigger it from StepWrapper

  const handleLocationSubmit = async (data: UserInput) => {
    setIsLoading(true);
    setUserInput(data);
    const climateData = await fetchClimateData(data.city);
    const profile = analyzeRisks(climateData, data);
    setRiskProfile(profile);
    setIsLoading(false);
    setCurrentStep(2);
  };

  const handleNext = () => {
    if (currentStep === 1) {
      // Trigger form submission inside LocationStep from here
      // The form's `onSubmit` will call `handleLocationSubmit`
      form.handleSubmit(handleLocationSubmit)();
    } else if (currentStep < TOTAL_STEPS) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleStartOver = () => {
    setCurrentStep(1);
    setUserInput(null);
    setRiskProfile(null);
  };

  const renderStepContent = () => {
    if (isLoading) {
      return (
         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex flex-col space-y-3 p-4 border rounded-lg">
                <div className="flex justify-between">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-5 w-5 rounded-full" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-4/5" />
                </div>
            </div>
          ))}
        </div>
      );
    }

    switch (currentStep) {
      case 1:
        return <LocationStep onSubmit={handleLocationSubmit} isLoading={isLoading} />;
      case 2:
        return riskProfile && <DashboardStep riskProfile={riskProfile} />;
      case 3:
        return riskProfile && <ChecklistStep riskProfile={riskProfile} />;
      case 4:
        return riskProfile && <TimeWindowsStep riskProfile={riskProfile} />;
      case 5:
        return riskProfile && <AdvisoryStep riskProfile={riskProfile} />;
      default:
        return null;
    }
  };

  const stepConfig = [
    { title: "Location and Details", description: "First, let's get some basic information to tailor your safety advisory." },
    { title: "Risk Dashboard", description: `Here is the current outdoor safety outlook for ${userInput?.city || ''}.` },
    { title: "Safety Checklist", description: "A personalized checklist to help you prepare before you head out." },
    { title: "Safe Time Windows", description: "Plan your activities during safer periods to minimize exposure to risks." },
    { title: "Final Advisory", description: "A summary of today's conditions and our final recommendations for you." }
  ];

  const currentConfig = stepConfig[currentStep - 1];

  return (
    <div className="flex flex-col min-h-screen bg-secondary/30">
      <Header />
      <main className="flex-grow">
        <StepWrapper
          title={currentConfig.title}
          description={currentConfig.description}
          currentStep={currentStep}
          totalSteps={TOTAL_STEPS}
          onNext={currentStep < TOTAL_STEPS ? handleNext : undefined}
          onBack={currentStep > 1 ? handleBack : undefined}
          onStartOver={currentStep === TOTAL_STEPS ? handleStartOver : undefined}
          isNextLoading={isLoading && currentStep === 1}
        >
          {renderStepContent()}
        </StepWrapper>
      </main>
      <Footer />
    </div>
  );
}
