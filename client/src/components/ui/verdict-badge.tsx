import { Verdict } from "@/lib/event-schema";
import { Badge, BadgeProps } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { AlertCircle, Check, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface VerdictBadgeProps {
  verdict: Verdict;
}

const getBadgeVariant = (result: string): BadgeProps["variant"] => {
  switch (result) {
    case "Supported":
      return "success-subtle";
    case "Refuted":
      return "destructive-subtle";
    case "Insufficient Information":
      return "warning-subtle";
    case "Conflicting Evidence":
      return "outline-subtle";
    default:
      return "secondary";
  }
};

const getIcon = (result: string) => {
  switch (result) {
    case "Supported":
      return <Check className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />;
    case "Refuted":
      return <X className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />;
    case "Insufficient Information":
      return <Info className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />;
    case "Conflicting Evidence":
      return <AlertCircle className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />;
    default:
      return null;
  }
};

export const VerdictBadge = ({ verdict }: VerdictBadgeProps) => (
  <Badge
    variant={getBadgeVariant(verdict.result)}
    className={cn(
      "flex items-center text-[11px] w-fit py-0.5 px-2 rounded-sm"
    )}
  >
    {getIcon(verdict.result)}
    <motion.span
      initial={{ opacity: 0, x: -2 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      className="truncate"
    >
      {verdict.result}
    </motion.span>
  </Badge>
);
