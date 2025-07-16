import { CheckCircle, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { SidebarMenuButton } from "../ui/sidebar";
import { Badge } from "../ui/badge";

export const AboutDialog = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <SidebarMenuButton tooltip="Learn about our fact-checking system">
          <Info />
          <span>About ClaimeAI</span>
        </SidebarMenuButton>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            About ClaimeAI
          </DialogTitle>
          <DialogDescription className="text-left space-y-4">
            <p>
              ClaimeAI is an advanced AI-powered fact-checking system that helps
              you verify the accuracy of textual claims using cutting-edge
              research methodologies.
            </p>
            <div className="space-y-2">
              <h4 className="font-semibold text-foreground">Key Features:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>
                  Automated claim extraction using the Claimify methodology
                </li>
                <li>Evidence-based verification through web search</li>
                <li>Detailed reporting with source citations</li>
                <li>Real-time processing and analysis</li>
              </ul>
            </div>
            <div className="flex gap-2 pt-2">
              <Badge variant="secondary">AI-Powered</Badge>
              <Badge variant="secondary">Research-Based</Badge>
              <Badge variant="secondary">Open Source</Badge>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};
