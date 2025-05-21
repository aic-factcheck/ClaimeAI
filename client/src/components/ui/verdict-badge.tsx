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
      return "success";
    case "Refuted":
      return "destructive";
    case "Insufficient Information":
      return "warning";
    case "Conflicting Evidence":
      return "outline";
    default:
      return "secondary";
  }
};

const getIcon = (result: string) => {
  switch (result) {
    case "Supported":
      return <Check className="w-3 h-3 mr-1" />;
    case "Refuted":
      return <X className="w-3 h-3 mr-1" />;
    case "Insufficient Information":
      return <Info className="w-3 h-3 mr-1" />;
    case "Conflicting Evidence":
      return <AlertCircle className="w-3 h-3 mr-1" />;
    default:
      return null;
  }
};

export const VerdictBadge = ({ verdict }: VerdictBadgeProps) => (
  <Badge
    variant={getBadgeVariant(verdict.result)}
    className={cn(
      "flex items-center text-xs w-fit font-medium py-0.5 px-2 rounded-sm"
    )}
  >
    {getIcon(verdict.result)}
    <motion.span
      initial={{ opacity: 0, x: -2 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
    >
      {verdict.result}
    </motion.span>
  </Badge>
);
