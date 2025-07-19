import NumberFlow, { useCanAnimate } from "@number-flow/react";
import { motion } from "framer-motion";
import { ArrowUp } from "lucide-react";

import { cn } from "@/lib/utils";

const MotionNumberFlow = motion.create(NumberFlow);
const MotionArrowUp = motion.create(ArrowUp);

interface AnimatedNumberProps {
  value: number;
  diff: number;
}

export const AnimatedNumber = ({ value, diff }: AnimatedNumberProps) => {
  const canAnimate = useCanAnimate();

  return (
    <span className="flex items-center justify-center gap-2">
      <NumberFlow
        className="font-semibold text-5xl"
        format={{ style: "currency", currency: "USD" }}
        value={value}
      />
      <motion.span
        className={cn(
          diff > 0 ? "bg-emerald-400" : "bg-red-500",
          "inline-flex items-center px-[0.3em] text-white transition-colors duration-300"
        )}
        layout={canAnimate}
        style={{ borderRadius: 999 }}
        transition={{ layout: { duration: 0.9, bounce: 0, type: "spring" } }}
      >
        {" "}
        <MotionArrowUp
          absoluteStrokeWidth
          animate={{ rotate: diff > 0 ? 0 : -180 }}
          className="mr-0.5 size-[0.75em]"
          initial={false}
          strokeWidth={3}
          transition={{
            rotate: { type: "spring", duration: 0.5, bounce: 0 },
          }}
        />{" "}
        <MotionNumberFlow
          className="font-semibold"
          format={{ style: "percent", maximumFractionDigits: 2 }}
          layout={canAnimate}
          layoutRoot={canAnimate}
          value={diff}
        />{" "}
      </motion.span>
    </span>
  );
};
