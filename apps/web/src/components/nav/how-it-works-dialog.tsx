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
          <DialogDescription className="text-left space-y-4">
            <p>
              Our fact-checking process follows a sophisticated multi-step
              pipeline to ensure accurate verification:
            </p>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-foreground flex items-center gap-2">
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
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-semibold">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-foreground flex items-center gap-2">
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
                <div className="flex-shrink-0 w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-semibold">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-foreground flex items-center gap-2">
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
                <div className="flex-shrink-0 w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-semibold">
                  4
                </div>
                <div>
                  <h4 className="font-semibold text-foreground flex items-center gap-2">
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
