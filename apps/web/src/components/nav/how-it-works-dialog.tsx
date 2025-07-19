import { FileText, Search, Shield, Target, Zap } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { SidebarMenuButton } from "../ui/sidebar";

const HOW_IT_WORKS_STEPS = [
  {
    icon: Target,
    title: "Claim Extraction",
    description:
      "Extract individual factual claims from your input text using the Claimify methodology",
  },
  {
    icon: Search,
    title: "Evidence Gathering",
    description:
      "Search for relevant evidence across the web to support or refute each claim",
  },
  {
    icon: Shield,
    title: "Verification",
    description:
      "Analyze evidence quality and determine if claims are supported, refuted, or inconclusive",
  },
  {
    icon: FileText,
    title: "Report Generation",
    description:
      "Compile a comprehensive report with verdicts, evidence, and source citations",
  },
];

export const HowItWorksDialog = () => (
  <Dialog>
    <DialogTrigger asChild>
      <SidebarMenuButton tooltip="Understanding the verification process">
        <Zap />
        <span>How it Works</span>
      </SidebarMenuButton>
    </DialogTrigger>
    <DialogContent className="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          How ClaimeAI Works
        </DialogTitle>
        <DialogDescription className="space-y-4 pt-2 text-left">
          <p>
            Our fact-checking process follows a sophisticated multi-step
            pipeline to ensure accurate verification:
          </p>
          <div className="space-y-6">
            {HOW_IT_WORKS_STEPS.map((step, index) => (
              <div key={step.title} className="flex items-start gap-4">
                <div className="space-y-1">
                  <h4 className="flex items-center text-base gap-1.5 font-semibold text-foreground">
                    <step.icon className="size-3.5" />
                    {step.title}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </DialogDescription>
      </DialogHeader>
    </DialogContent>
  </Dialog>
);
