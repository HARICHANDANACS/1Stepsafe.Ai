import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Risk, RiskProfile, RiskLevel } from "@/lib/data";

type DashboardStepProps = {
  riskProfile: RiskProfile;
};

const riskLevelColors: Record<RiskLevel, string> = {
  Low: "bg-green-500",
  Medium: "bg-yellow-500",
  High: "bg-red-500",
  Extreme: "bg-purple-700",
};

const riskLevelBorderColors: Record<RiskLevel, string> = {
  Low: "border-green-200",
  Medium: "border-yellow-200",
  High: "border-red-200",
  Extreme: "border-purple-300",
};

function RiskCard({ risk }: { risk: Risk }) {
  return (
    <Card className={cn("flex flex-col", riskLevelBorderColors[risk.level])}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{risk.name}</CardTitle>
        <risk.Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="flex flex-col flex-grow justify-between">
        <div>
          <div className="flex items-baseline gap-2">
            <span
              className={cn(
                "inline-block h-3 w-3 rounded-full",
                riskLevelColors[risk.level]
              )}
            />
            <div className="text-2xl font-bold">{risk.level}</div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {risk.explanation}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardStep({ riskProfile }: DashboardStepProps) {
  const risks = Object.values(riskProfile);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {risks.map((risk) => (
        <RiskCard key={risk.name} risk={risk} />
      ))}
    </div>
  );
}
