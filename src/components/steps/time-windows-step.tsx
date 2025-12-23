import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generateTimeWindows } from "@/lib/risk-engine";
import type { RiskProfile } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Sunrise, Sunset, Clock } from "lucide-react";

type TimeWindowsStepProps = {
  riskProfile: RiskProfile;
};

const levelClasses = {
    Safer: {
        bg: "bg-green-100 dark:bg-green-900/50",
        border: "border-green-500",
        text: "text-green-800 dark:text-green-300",
        icon: Sunrise
    },
    Unsafe: {
        bg: "bg-red-100 dark:bg-red-900/50",
        border: "border-red-500",
        text: "text-red-800 dark:text-red-300",
        icon: Sunset
    }
};

export function TimeWindowsStep({ riskProfile }: TimeWindowsStepProps) {
  const timeWindows = generateTimeWindows(riskProfile);

  return (
    <div className="space-y-4">
      {timeWindows.map((window, index) => {
        const styles = levelClasses[window.level];
        const Icon = styles.icon;
        
        return (
          <Card key={index} className={cn("overflow-hidden", styles.bg)}>
            <div className={cn("flex items-start gap-4 p-4", styles.border, "border-l-4")}>
              <Icon className={cn("h-8 w-8 mt-1 flex-shrink-0", styles.text)} />
              <div>
                <div className="flex items-baseline gap-3">
                    <h4 className={cn("font-bold text-lg", styles.text)}>{window.level}</h4>
                    <p className="text-sm font-medium text-foreground/80">{window.period}</p>
                </div>
                <p className="text-sm text-muted-foreground">{window.reason}</p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
