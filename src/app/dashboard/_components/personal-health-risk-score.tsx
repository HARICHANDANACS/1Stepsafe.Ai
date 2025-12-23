'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface PersonalHealthRiskScoreProps {
    score: number;
}

const getRiskColor = (score: number) => {
    if (score > 75) return 'text-red-500';
    if (score > 50) return 'text-orange-500';
    if (score > 25) return 'text-yellow-500';
    return 'text-green-500';
}

const getRiskDescription = (score: number) => {
    if (score > 75) return 'High';
    if (score > 50) return 'Elevated';
    if (score > 25) return 'Moderate';
    return 'Low';
}

export function PersonalHealthRiskScore({ score }: PersonalHealthRiskScoreProps) {
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardDescription>Personal Health Risk</CardDescription>
                <CardTitle className={`text-5xl ${getRiskColor(score)}`}>
                    {score}
                    <span className="text-2xl text-muted-foreground">/100</span>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-xs text-muted-foreground">
                    Today's risk is <span className="font-bold">{getRiskDescription(score)}</span>
                </div>
            </CardContent>
        </Card>
    )
}
