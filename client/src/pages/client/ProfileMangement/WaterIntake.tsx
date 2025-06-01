
"use client";

import type React from "react";
import { useEffect, useRef } from "react";
import { Droplet } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { motion, useAnimation } from "framer-motion";

interface WaterIntakeProps {
  value: number;
  targetValue: number;
  onChange: (value: number) => void;
  onTargetChange: (value: number) => void;
  className?: string;
}

const WaterIntake: React.FC<WaterIntakeProps> = ({
  value,
  targetValue,
  onChange,
  onTargetChange,
  className,
}) => {
  const controls = useAnimation();
  const prevValueRef = useRef(value);

  useEffect(() => {
    controls.start({ width: `${percentage}%` });
    prevValueRef.current = value;
  }, [value, controls]);

  const handleSliderChange = (newValue: number[]) => {
    onChange(newValue[0]);
  };

  const handleTargetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTarget = e.target.value ? Number(e.target.value) : 0;
    if (newTarget >= 0 && newTarget <= 8000) {
      onTargetChange(newTarget);
    }
  };

  const maxWater = 8000;
  const percentage = Math.min((value / (targetValue || maxWater)) * 100, 100);

  let waterColor = "bg-blue-100";
  if (percentage > 25) waterColor = "bg-blue-200";
  if (percentage > 50) waterColor = "bg-blue-300";
  if (percentage > 75) waterColor = "bg-blue-400";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn("space-y-4", className)}
    >
      <div className="flex items-end justify-between">
        <motion.div
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.05, 1], transition: { duration: 0.3 } }}
          key={value}
        >
          <p className="text-2xl font-bold tracking-tight">
            {value >= 1000 ? `${(value / 1000).toFixed(1)}L` : `${value}ml`}
          </p>
          <p className="text-sm text-muted-foreground">Daily water intake</p>
        </motion.div>
        <div className="flex items-center text-sm text-muted-foreground">
          <span className="mr-2">
            Target: {targetValue >= 1000 ? `${(targetValue / 1000).toFixed(1)}L` : `${targetValue}ml`}
          </span>
          <motion.div
            animate={{ y: [0, -3, 0], transition: { repeat: Number.POSITIVE_INFINITY, duration: 1.5 } }}
          >
            <Droplet size={16} className="text-blue-400" />
          </motion.div>
        </div>
      </div>
      <div className="relative h-8 w-full rounded-full overflow-hidden border bg-background p-1">
        <motion.div
          className={cn("absolute left-0 top-0 bottom-0 rounded-full", waterColor)}
          initial={{ width: `${Math.min((prevValueRef.current / (targetValue || maxWater)) * 100, 100)}%` }}
          animate={controls}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ opacity: [0.7, 1, 0.7], scale: [0.98, 1, 0.98] }}
          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 3 }}
        >
          <div className="flex items-center space-x-1.5 text-xs font-medium">
            <motion.div
              animate={{ scale: [1, 1.1, 1], transition: { repeat: Number.POSITIVE_INFINITY, duration: 2 } }}
            >
              <Droplet size={14} className="text-blue-600" />
            </motion.div>
            <span className="mix-blend-difference text-white">{Math.round(percentage)}%</span>
          </div>
        </motion.div>
      </div>
      <Slider
        value={[value]}
        min={0}
        max={maxWater}
        step={100}
        onValueChange={handleSliderChange}
        className="py-4"
      />
      <div className="space-y-2">
        <label className="text-xs font-medium text-[#6d28d9]">
          Set Water Intake Target (ml)
        </label>
        <div className="relative">
          <Droplet className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[var(--violet)]" />
          <Input
            type="number"
            value={targetValue}
            onChange={handleTargetChange}
            min={0}
            max={8000}
            step={100}
            placeholder="Enter target water intake (ml)"
            className="pl-8 h-9 text-sm border-[var(--input)] focus:ring-[var(--violet)] focus:border-[var(--violet)]"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default WaterIntake;