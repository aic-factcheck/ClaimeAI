import { TooltipProvider } from "@/components/ui/tooltip";
import { ClerkProvider } from "@clerk/nextjs";
import { NuqsAdapter } from "nuqs/adapters/next/app";

export const Providers = ({ children }: Readonly<React.PropsWithChildren>) => (
  <ClerkProvider>
    <NuqsAdapter>
      <TooltipProvider>{children} </TooltipProvider>
    </NuqsAdapter>
  </ClerkProvider>
);
