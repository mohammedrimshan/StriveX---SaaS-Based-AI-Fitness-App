import  { useState } from 'react';
import { format, addMonths, subMonths, startOfMonth, isSameMonth, isSameDay, isToday, addDays } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CalendarModalProps } from '@/types/Slot';

export function CalendarModal({
  id,
  name,
  value,
  onChange,
  label,
  className
}: CalendarModalProps) {
  const [open, setOpen] = useState(false);
  const selectedDate = value ? new Date(value) : undefined;
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Navigate to previous month
  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  // Navigate to next month
  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  // Get all days in current month view
  const monthStart = startOfMonth(currentMonth);

  
  // Start calendar from Sunday of the week containing the first day of month
  const startDate = addDays(monthStart, -monthStart.getDay());
  
  // Get day names for header
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Generate 6 weeks of calendar days (42 days)
  const calendarDays = [];
  let day = startDate;
  for (let i = 0; i < 42; i++) {
    calendarDays.push(day);
    day = addDays(day, 1);
  }

  // Handle date selection
  const handleDateClick = (date: Date) => {
    // Prevent selecting dates in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (date < today) return;
    
    const formattedDate = format(date, 'yyyy-MM-dd');
    onChange(formattedDate);
    setOpen(false);
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
            className={cn(
              "w-full justify-start text-left font-normal border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800",
              !selectedDate && "text-muted-foreground"
            )}
            id={id}
            type="button"
          >
            <CalendarIcon className="mr-2 h-4 w-4 text-purple-500" />
            {selectedDate ? format(selectedDate, "EEEE, MMMM d, yyyy") : <span>Select date</span>}
          </Button>
        </DialogTrigger>
        
        <DialogContent className="p-0 gap-0 max-w-sm">
          <DialogHeader className="px-4 pt-4 pb-2 border-b dark:border-gray-700">
            <DialogTitle className="text-center font-medium">Select Date</DialogTitle>
          </DialogHeader>
          
          <div className="p-4">
            {/* Header with month navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={prevMonth}
                className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
              >
                <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
              
              <h2 className="font-medium text-gray-700 dark:text-gray-300">
                {format(currentMonth, 'MMMM yyyy')}
              </h2>
              
              <button
                type="button"
                onClick={nextMonth}
                className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
              >
                <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
            
            {/* Calendar grid */}
            <div>
              {/* Days of week header */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map((day) => (
                  <div
                    key={day}
                    className="text-center text-sm font-medium text-gray-500 dark:text-gray-400"
                  >
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendar days */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((date, i) => {
                  const isCurrentMonth = isSameMonth(date, currentMonth);
                  const isSelected = selectedDate ? isSameDay(date, selectedDate) : false;
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const isPast = date < today;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleDateClick(date)}
                      disabled={isPast}
                      className={cn(
                        "h-10 flex items-center justify-center rounded-md text-sm transition-colors",
                        isCurrentMonth ? "text-gray-700 dark:text-gray-300" : "text-gray-400 dark:text-gray-500",
                        isPast && isCurrentMonth ? "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed" : "",
                        isSelected ? "bg-purple-500 text-white hover:bg-purple-600" : "hover:bg-gray-100 dark:hover:bg-gray-700",
                        isToday(date) && !isSelected ? "border border-purple-500" : ""
                      )}
                    >
                      {format(date, 'd')}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <input type="hidden" id={`${id}-hidden`} name={name} value={value || ""} />
    </div>
  );
}