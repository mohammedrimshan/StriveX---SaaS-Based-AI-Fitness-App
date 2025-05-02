import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface TimePickerProps {
  id: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  label?: string;
  className?: string;
}

const generateTimeSlots = (interval: number = 30): string[] => {
  const times: string[] = [];
  const totalMinutesInDay = 24 * 60;
  
  for (let minutes = 0; minutes < totalMinutesInDay; minutes += interval) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    // Format as HH:MM
    times.push(
      `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
    );
  }
  
  return times;
};

export const TimePicker: React.FC<TimePickerProps> = ({
  id,
  name,
  value,
  onChange,
  label,
  className
}) => {
  const [open, setOpen] = useState(false);
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  
  useEffect(() => {
    // Generate time slots in 30-minute intervals
    setTimeSlots(generateTimeSlots(30));
  }, []);

  const handleTimeSelect = (time: string) => {
    onChange(time);
    setOpen(false);
  };
  
  const displayTime = (time: string) => {
    if (!time) return "Select time";
    // Parse the 24h time string and format to display time (either 12h or 24h format)
    const [hours, minutes] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    
    return format(date, 'h:mm a'); // Format as 12-hour time with am/pm
  };
  
  return (
    <div className={cn("relative", className)}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            type="button"
            className={cn(
              "w-full justify-start text-left font-normal border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800",
              !value && "text-muted-foreground"
            )}
          >
            <Clock className="mr-2 h-4 w-4 text-purple-500" />
            <span>{displayTime(value)}</span>
          </Button>
        </DialogTrigger>
        
        <DialogContent className="sm:max-w-[400px] p-0 gap-0">
          <DialogHeader className="px-4 pt-4 pb-2 border-b dark:border-gray-700">
            <DialogTitle className="text-center font-medium">Select Time</DialogTitle>
          </DialogHeader>
          
          <div className="max-h-[300px] overflow-y-auto p-4 scrollbar-none">
            <div className="grid grid-cols-3 gap-2">
              {timeSlots.map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => handleTimeSelect(time)}
                  className={cn(
                    "py-2 px-1 rounded-md text-sm font-medium transition-all hover:bg-purple-100 dark:hover:bg-purple-900/30",
                    time === value ? 
                      "bg-purple-500 text-white hover:bg-purple-600 dark:hover:bg-purple-600" : 
                      "bg-gray-50 dark:bg-gray-800"
                  )}
                >
                  {displayTime(time)}
                </button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <input
        type="hidden"
        id={`${id}-hidden`}
        name={name}
        value={value || ""}
      />
    </div>
  );
};