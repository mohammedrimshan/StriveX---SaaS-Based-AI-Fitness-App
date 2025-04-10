"use client"

import type React from "react"
import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { motion } from "framer-motion"

interface HealthCondition {
  id: string
  label: string
}

interface HealthConditionsProps {
  initialConditions?: string[]
  onConditionsChange: (conditions: string[]) => void
}

const HealthConditions: React.FC<HealthConditionsProps> = ({ initialConditions = [], onConditionsChange }) => {
  const [selectedConditions, setSelectedConditions] = useState<string[]>(initialConditions)

  const healthConditions: HealthCondition[] = [
    { id: "diabetes", label: "Diabetes" },
    { id: "heart-disease", label: "Heart Disease" },
    { id: "asthma", label: "Asthma" },
    { id: "allergies", label: "Allergies" },
    { id: "hypertension", label: "Hypertension" },
    { id: "other", label: "Other" },
  ]

  const handleCheckboxChange = (conditionId: string, checked: boolean) => {
    let updatedConditions: string[]
    if (checked) {
      updatedConditions = [...selectedConditions, conditionId]
    } else {
      updatedConditions = selectedConditions.filter((id) => id !== conditionId)
    }
    setSelectedConditions(updatedConditions)
    onConditionsChange(updatedConditions)
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">Health Conditions</h3>
      <div className="space-y-2">
        {healthConditions.map((condition, index) => (
          <motion.div
            key={condition.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            whileHover={{ scale: 1.02, backgroundColor: "var(--accent)" }}
            className="flex items-center space-x-3 rounded-md border p-3 transition-all hover:shadow-md"
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
  )
}

export default HealthConditions
