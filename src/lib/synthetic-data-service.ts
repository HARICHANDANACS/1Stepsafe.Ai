
import type { DailyHealthReport, RiskLevel } from './data';
import type { UserProfile } from './data';

// Simple deterministic pseudo-random number generator
function seededRandom(seed: number) {
    let x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

// Function to create a consistent seed based on user profile and date
function createDailySeed(profile: UserProfile): number {
    const date = new Date();
    const day = date.getDate();
    const month = date.getMonth();
    const lat = profile.location.lat || 34.05;
    const lon = profile.location.lon || -118.24;
    return day + month + lat + lon;
}


function getRiskLevel(value: number): RiskLevel {
    if (value > 0.8) return 'Extreme';
    if (value > 0.6) return 'High';
    if (value > 0.4) return 'Medium';
    return 'Low';
}

export function generateSyntheticDailyHealthReport(userProfile: UserProfile): DailyHealthReport {
    const seed = createDailySeed(userProfile);
    let rand = seededRandom(seed);

    const personalHealthRiskScore = Math.floor(rand * 70) + 20; // Score between 20 and 90

    rand = seededRandom(seed + 1);
    const tempChange = (rand * 10) - 5; // -5 to +5 change

    rand = seededRandom(seed + 2);
    const aqiChange = Math.floor((rand * 40) - 20); // -20 to +20 change

    const isMiddayUnsafe = personalHealthRiskScore > 50;

    return {
        dailySummary: {
            personalHealthRiskScore,
            quickInsight: `Your personal health risk is ${getRiskDescription(personalHealthRiskScore).toLowerCase()} today, mainly due to ${personalHealthRiskScore > 60 ? 'high heat and UV exposure' : 'moderate air quality'}.`,
            whatChanged: {
                tempChange,
                aqiChange,
            },
            safeWindows: [
                { start: '00:00', end: '07:00', isSafe: true },
                { start: '07:00', end: '12:00', isSafe: true },
                { start: '12:00', end: '16:00', isSafe: !isMiddayUnsafe },
                { start: '16:00', end: '23:59', isSafe: true },
            ]
        },
        safetyAdvisory: {
            advisory: `Overall, today presents a ${getRiskDescription(personalHealthRiskScore).toLowerCase()} risk. Pay attention during midday hours when UV and heat levels are highest. Remember to stay hydrated and take breaks if you're outdoors.`
        },
        dailyGuidance: {
            phases: [
                {
                    phase: 'Morning Commute',
                    startTime: userProfile.routine.morningCommuteStart,
                    endTime: userProfile.routine.workHoursStart,
                    risks: {
                        heatRisk: getRiskLevel(seededRandom(seed + 3)),
                        uvRisk: 'Low',
                        aqiRisk: getRiskLevel(seededRandom(seed + 4)),
                        rainExposure: 'Low',
                    },
                    summary: 'Your morning commute looks relatively clear. Air quality is the main factor to consider.',
                    recommendations: [
                        'Check the AQI before you leave.',
                        userProfile.commuteType === 'Bike' || userProfile.commuteType === 'Walk'
                            ? 'Consider a light mask if you are sensitive to air quality.'
                            : 'Ensure your car\'s air filter is clean.',
                        'Enjoy the cooler morning temperatures.'
                    ]
                },
                {
                    phase: 'Work Hours',
                    startTime: userProfile.routine.workHoursStart,
                    endTime: userProfile.routine.eveningCommuteStart,
                    risks: {
                        heatRisk: getRiskLevel(seededRandom(seed + 5)),
                        uvRisk: getRiskLevel(seededRandom(seed + 6)),
                        aqiRisk: getRiskLevel(seededRandom(seed + 7)),
                        rainExposure: 'Low',
                    },
                    summary: 'Midday brings the highest heat and UV risk. Plan outdoor activities carefully.',
                    recommendations: [
                        'If you go out for lunch, try to stay in the shade.',
                        'Apply sunscreen if you will be near windows or outdoors.',
                        'Stay hydrated throughout the day.',
                    ]
                },
                {
                    phase: 'Evening Commute',
                    startTime: userProfile.routine.eveningCommuteStart,
                    endTime: (parseInt(userProfile.routine.eveningCommuteStart.split(':')[0]) + 1).toString().padStart(2, '0') + ':00',
                    risks: {
                        heatRisk: getRiskLevel(seededRandom(seed + 8) * 0.7), // Lower in evening
                        uvRisk: 'Low',
                        aqiRisk: getRiskLevel(seededRandom(seed + 9)),
                        rainExposure: 'Low',
                    },
                    summary: 'Conditions improve for your evening commute, but be aware of lingering air quality issues.',
                    recommendations: [
                        'It\'s a good time for a walk or bike ride, but check the AQI first.',
                        'Open windows to ventilate your home once home, if AQI is good.',
                    ]
                }
            ]
        }
    };
}


function getRiskDescription(score: number): string {
    if (score > 75) return 'High';
    if (score > 50) return 'Elevated';
    if (score > 25) return 'Moderate';
    return 'Low';
}
