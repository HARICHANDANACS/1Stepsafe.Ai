import { cn } from "@/lib/utils";

export const StepSafeLogo = ({ className }: { className?: string }) => (
  <div className={cn("flex items-center gap-2", className)}>
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-primary"
    >
      <path
        d="M12 2L2 7V17C2 18.1046 2.89543 19 4 19H20C21.1046 19 22 18.1046 22 17V7L12 2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 15L15 12L12 9L9 12L12 15Z"
        fill="currentColor"
      />
    </svg>
    <span className="font-bold text-lg text-foreground tracking-tight">
      StepSafe AI
    </span>
  </div>
);
