import type { ChecklistItem } from "@/lib/data";
import { generateChecklist } from "@/lib/risk-engine";
import type { RiskProfile } from "@/lib/data";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

type ChecklistStepProps = {
  riskProfile: RiskProfile;
};

export function ChecklistStep({ riskProfile }: ChecklistStepProps) {
  const checklistItems = generateChecklist(riskProfile);

  if (checklistItems.length === 0) {
    return (
        <Card className="text-center p-8">
            <CheckCircle2 className="mx-auto h-12 w-12 text-green-500 mb-4" />
            <h3 className="text-xl font-semibold">All Clear!</h3>
            <p className="text-muted-foreground mt-2">
                No specific precautions are needed today. Enjoy the pleasant conditions!
            </p>
        </Card>
    );
  }

  return (
    <div className="space-y-3">
      {checklistItems.map((item) => (
        <Card key={item.id} className="p-4">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <item.Icon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold">{item.recommendation}</h4>
              <p className="text-sm text-muted-foreground">{item.details}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
