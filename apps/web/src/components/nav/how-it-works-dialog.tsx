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

export const HowItWorksDialog = () => {
  return (
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
            <Zap className="h-5 w-5 text-blue-600" />
            How ClaimeAI Works
          </DialogTitle>
          <DialogDescription className="space-y-4 text-left">
            <p>
              Our fact-checking process follows a sophisticated multi-step
              pipeline to ensure accurate verification:
            </p>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-600 text-sm">
                  1
                </div>
                <div>
                  <h4 className="flex items-center gap-2 font-semibold text-foreground">
                    <Target className="h-4 w-4" />
                    Claim Extraction
                  </h4>
                  <p className="text-sm">
                    Extract individual factual claims from your input text using
                    the Claimify methodology
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-green-100 font-semibold text-green-600 text-sm">
                  2
                </div>
                <div>
                  <h4 className="flex items-center gap-2 font-semibold text-foreground">
                    <Search className="h-4 w-4" />
                    Evidence Gathering
                  </h4>
                  <p className="text-sm">
                    Search for relevant evidence across the web to support or
                    refute each claim
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 font-semibold text-purple-600 text-sm">
                  3
                </div>
                <div>
                  <h4 className="flex items-center gap-2 font-semibold text-foreground">
                    <Shield className="h-4 w-4" />
                    Verification
                  </h4>
                  <p className="text-sm">
                    Analyze evidence quality and determine if claims are
                    supported, refuted, or inconclusive
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-orange-100 font-semibold text-orange-600 text-sm">
                  4
                </div>
                <div>
                  <h4 className="flex items-center gap-2 font-semibold text-foreground">
                    <FileText className="h-4 w-4" />
                    Report Generation
                  </h4>
                  <p className="text-sm">
                    Compile a comprehensive report with verdicts, evidence, and
                    source citations
                  </p>
                </div>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};
