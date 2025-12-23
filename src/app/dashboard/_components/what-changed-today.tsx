'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";

interface WhatChangedTodayProps {
    tempChange: number;
    aqiChange: number;
}

const ChangeIndicator = ({ value }: { value: number }) => {
    const isUp = value > 0;
    const isDown = value < 0;
    const Icon = isUp ? ArrowUp : isDown ? ArrowDown : Minus;
    const color = isUp ? 'text-red-500' : isDown ? 'text-green-500' : 'text-muted-foreground';

    return (
        <div className={`flex items-center font-medium ${color}`}>
            <Icon className="h-4 w-4 mr-1" />
            <span>{Math.abs(value)}</span>
        </div>
    )
}

export function WhatChangedToday({ tempChange, aqiChange }: WhatChangedTodayProps) {
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardDescription>What Changed Today</CardDescription>
                <CardTitle className="text-base">vs. Yesterday</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Temperature</span>
                    <ChangeIndicator value={Math.round(tempChange)} />
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Air Quality (AQI)</span>
                    <ChangeIndicator value={Math.round(aqiChange)} />
                </div>
            </CardContent>
        </Card>
    );
}
