import type { DailyHealthReport, UserProfile, ClimateData } from './data';

// A deterministic random number generator for consistent mock data
const createDeterministicRandom = (seed: number) => {
    let state = seed;
    return () => {
        const x = Math.sin(state++) * 10000;
        return x - Math.floor(x);
    };
}

interface SyntheticReportInput {
    userProfile: UserProfile;
    todayClimate: ClimateData;
    yesterdayClimate: ClimateData;
}

export function generateSyntheticDailyHealthReport(input: SyntheticReportInput): DailyHealthReport {
    const { userProfile, todayClimate, yesterdayClimate } = input;
    
    const seed = (userProfile.location.lat || 0) + (userProfile.location.lon || 0) + new Date().getDate();
    const random = createDeterministicRandom(seed);

    // 1. Generate Daily Summary
    const personalHealthRiskScore = Math.floor(random() * 80) + 10; // Score between 10 and 90
    const quickInsight = personalHealthRiskScore > 60 
        ? "Your personal health risk is elevated today, mainly due to increased heat and moderate air quality."
        : "Today looks good! Your personal health risk is low, but remember to stay hydrated.";

    const dailySummary = {
        personalHealthRiskScore,
        quickInsight,
        whatChanged: {
            tempChange: todayClimate.temperature - yesterdayClimate.temperature,
            aqiChange: todayClimate.aqi - yesterdayClimate.aqi,
        },
        safeWindows: [
            { start: "00:00", end: "10:00", isSafe: true },
            { start: "10:00", end: "16:00", isSafe: false },
            { start: "16:00", end: "20:00", isSafe: true },
            { start: "20:00", end: "23:59", isSafe: true },
        ]
    };

    // 2. Generate Safety Advisory
    const safetyAdvisory = {
        advisory: `Overall risk today is ${personalHealthRiskScore > 60 ? 'Moderate to High' : 'Low'}. Pay special attention during your commute and midday. Key factors are UV exposure and afternoon heat. Ensure you have water and consider wearing a hat.`
    };

    // 3. Generate Daily Guidance
    const commuteRecommendations = {
        'Walk': ["Wear breathable clothing.", "Consider taking a slightly earlier or later commute to avoid peak heat."],
        'Bike': ["Stay hydrated; bring a water bottle.", "Use a route with more shade if possible."],
        'Public Transport': ["Check for service alerts before you leave.", "Keep hand sanitizer with you."],
        'Drive': ["Check your tire pressure.", "Ventilate your car before driving as interior can get very hot."]
    }[userProfile.commuteType];


    const dailyGuidance = {
        phases: [
            {
                phase: 'Morning Commute' as const,
                startTime: userProfile.routine.morningCommuteStart,
                endTime: userProfile.routine.workHoursStart,
                risks: { heatRisk: 'Low' as const, uvRisk: 'Medium' as const, aqiRisk: 'Low' as const, rainExposure: 'Low' as const },
                summary: "Morning conditions are generally pleasant. The primary concern is rising UV levels as you approach midday.",
                recommendations: ["Apply sunscreen before you leave.", ...commuteRecommendations.slice(0,1)],
            },
            {
                phase: 'Work Hours' as const,
                startTime: userProfile.routine.workHoursStart,
                endTime: userProfile.routine.eveningCommuteStart,
                risks: { heatRisk: 'Medium' as const, uvRisk: 'High' as const, aqiRisk: 'Medium' as const, rainExposure: 'Low' as const },
                summary: "Midday presents the highest risk with peak UV and heat. If you go out for lunch, be mindful of sun exposure.",
                recommendations: ["Avoid direct sun exposure between 12 PM and 3 PM.", "If you eat out, choose a place indoors or in a shaded area.", "Reapply sunscreen if you'll be outside for more than an hour."],
            },
            {
                phase: 'Evening Commute' as const,
                startTime: userProfile.routine.eveningCommuteStart,
                endTime: (parseInt(userProfile.routine.eveningCommuteStart.split(':')[0]) + 1).toString().padStart(2, '0') + ':00',
                risks: { heatRisk: 'Medium' as const, uvRisk: 'Low' as const, aqiRisk: 'Medium' as const, rainExposure: 'Low' as const },
                summary: "The temperature will be pleasant, but air quality may be lower due to daily pollution accumulation.",
                recommendations: ["Stay hydrated after your workday.", ...commuteRecommendations.slice(1,2)],
            },
        ]
    };

    return {
        dailySummary,
        safetyAdvisory,
        dailyGuidance
    };
}
