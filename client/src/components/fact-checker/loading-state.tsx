import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  message: string;
}

export const LoadingState = ({ message }: LoadingStateProps) => (
  <div className="flex flex-col items-center justify-center py-8">
    <motion.div
      className={cn(
        "w-6 h-6 border-2 border-t-blue-600 border-blue-100 rounded-full mb-3"
      )}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
    <motion.p
      className="text-xs text-neutral-500"
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      {message}
    </motion.p>
  </div>
);

export const ProcessingIndicator = ({ message }: { message: string }) => (
  <motion.div
    initial={{ opacity: 0, y: -5 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.2 }}
    className={cn(
      "flex items-center gap-2.5 py-2 px-3 bg-blue-50 border border-blue-100 rounded-[4px]"
    )}
  >
    <motion.div
      className="w-3 h-3 border-[1.5px] border-blue-100 border-t-blue-500 rounded-full"
      animate={{ rotate: 360 }}
      transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
    />
    <p className="text-xs text-blue-600 font-medium">{message}</p>
  </motion.div>
);
