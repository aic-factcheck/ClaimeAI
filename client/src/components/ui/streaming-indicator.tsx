import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface StreamingIndicatorProps {
  isActive: boolean;
}

export const StreamingIndicator = ({ isActive }: StreamingIndicatorProps) => {
  if (!isActive) return null;
  return (
    <motion.div
      className={cn("flex items-center gap-1 ml-2 text-blue-500 font-medium")}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      transition={{ duration: 0.2 }}
    >
      <div className="relative flex gap-0.5">
        <motion.div
          className="w-[3px] h-[3px] bg-blue-500 rounded-full"
          animate={{ scale: [1, 1.5, 1] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}
        />
        <motion.div
          className="w-[3px] h-[3px] bg-blue-500 rounded-full"
          animate={{ scale: [1, 1.5, 1] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
        />
        <motion.div
          className="w-[3px] h-[3px] bg-blue-500 rounded-full"
          animate={{ scale: [1, 1.5, 1] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: 0.8 }}
        />
      </div>
      <span className="text-xs">streaming</span>
    </motion.div>
  );
};
