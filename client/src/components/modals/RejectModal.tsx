"use client"

import { useState } from "react"
import { XCircle, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

interface RejectionModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (reason: string, category: string) => void
  trainerName: string
  trainerEmail?: string
  applicationDate?: string
}

export function RejectionModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  trainerName,
  trainerEmail,
  applicationDate
}: RejectionModalProps) {
  const [rejectionReason, setRejectionReason] = useState("")
  const [category, setCategory] = useState("")
  const [showWarning, setShowWarning] = useState(false)

  const commonReasons = [
    "Insufficient experience in the required field",
    "Missing qualifications or certifications",
    "Incomplete application details",
    "Does not meet minimum training hours requirement"
  ]

  const handleSubmit = () => {
    if (rejectionReason.length < 20) {
      setShowWarning(true)
      return
    }
    onSubmit(rejectionReason, category)
    setRejectionReason("")
    setCategory("")
    setShowWarning(false)
  }

  const handleClose = () => {
    setRejectionReason("")
    setCategory("")
    setShowWarning(false)
    onClose()
  }

  const handleReasonSelect = (reason: string) => {
    setRejectionReason(prev => prev ? `${prev}\n\n${reason}` : reason)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-gray-950 shadow-lg border-0 rounded-lg overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-2 bg-red-500"></div>
        <DialogHeader className="pt-6">
          <DialogTitle className="flex items-center gap-2 text-red-600 font-bold text-xl">
            <XCircle className="h-6 w-6" />
            Reject Trainer Application
          </DialogTitle>
          <Badge className="w-fit bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100 mb-2">
            Action Required
          </Badge>
          <DialogDescription className="text-gray-600 dark:text-gray-400">
            Provide a detailed explanation for rejecting <span className="font-medium text-black dark:text-white">{trainerName}'s</span> application.
          </DialogDescription>
        </DialogHeader>
        
        {(trainerEmail || applicationDate) && (
          <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-md mb-4 text-sm">
            {trainerEmail && <p className="text-gray-600 dark:text-gray-400">Email: <span className="font-medium text-gray-800 dark:text-gray-200">{trainerEmail}</span></p>}
            {applicationDate && <p className="text-gray-600 dark:text-gray-400">Applied: <span className="font-medium text-gray-800 dark:text-gray-200">{applicationDate}</span></p>}
          </div>
        )}
        
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Rejection Category</label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="border-gray-200 dark:border-gray-700 focus:ring-violet-500">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="qualifications">Qualifications</SelectItem>
                <SelectItem value="experience">Experience</SelectItem>
                <SelectItem value="incomplete">Incomplete Application</SelectItem>
                <SelectItem value="fit">Not a Good Fit</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Detailed Explanation</label>
            <Textarea
              placeholder="Provide specific reasons for the rejection..."
              value={rejectionReason}
              onChange={(e) => {
                setRejectionReason(e.target.value)
                if (showWarning && e.target.value.length >= 20) {
                  setShowWarning(false)
                }
              }}
              className={`min-h-[120px] border-gray-200 dark:border-gray-700 focus-visible:ring-violet-500 ${
                showWarning ? 'border-red-300 focus-visible:ring-red-500' : ''
              }`}
            />
            {showWarning && (
              <div className="flex items-center gap-2 text-red-600 text-sm mt-1">
                <AlertTriangle className="h-4 w-4" />
                <span>Please provide a more detailed explanation (at least 20 characters)</span>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Common Reasons</label>
            <div className="flex flex-wrap gap-2">
              {commonReasons.map((reason, index) => (
                <button
                  key={index}
                  onClick={() => handleReasonSelect(reason)}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-full text-sm transition-colors"
                >
                  {reason}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <Separator className="my-1" />
        
        <DialogFooter className="flex gap-2 justify-end pt-2">
          <Button variant="outline" onClick={handleClose} className="border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-900">
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleSubmit} 
            disabled={!rejectionReason.trim() || !category}
            className="bg-red-600 hover:bg-red-700 transition-colors"
          >
            Submit Rejection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}