// ProfileMangement/HealthConditions.tsx
"use client";

import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export type HealthCondition = {
  id: string;
  label: string;
};

interface HealthConditionsProps {
  conditions: HealthCondition[];
  selectedConditions: string[];
  onChange: (selectedIds: string[]) => void;
  className?: string;
}

const HealthConditions: React.FC<HealthConditionsProps> = ({
  conditions,
  selectedConditions,
  onChange,
  className,
}) => {
  const handleCheckboxChange = (conditionId: string, checked: boolean) => {
    if (checked) {
      onChange([...selectedConditions, conditionId]);
    } else {
      onChange(selectedConditions.filter((id) => id !== conditionId));
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {conditions.map((condition, index) => (
          <motion.div
            key={condition.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            whileHover={{ scale: 1.02 }}
            className="flex items-center space-x-3 rounded-md border p-3 transition-colors hover:bg-accent hover:shadow-md"
          >
            <Checkbox
              id={`condition-${condition.id}`}
              checked={selectedConditions.includes(condition.id)}
              onCheckedChange={(checked) => handleCheckboxChange(condition.id, checked === true)}
              className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
            />
            <Label
              htmlFor={`condition-${condition.id}`}
              className="cursor-pointer flex-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {condition.label}
            </Label>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default HealthConditions;