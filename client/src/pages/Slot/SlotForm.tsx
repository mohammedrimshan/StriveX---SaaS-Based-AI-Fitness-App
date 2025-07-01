import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils';
import { useToaster } from '@/hooks/ui/useToaster';
import { CalendarModal } from './DatePicker';
import { TimePicker } from './TimePicker';
import { SlotFormProps, SlotFormData } from '@/types/Slot';

export const SlotForm: React.FC<SlotFormProps> = ({
  onSubmit,
  isSubmitting,
  isSuccess,
  isError,
  error
}) => {
  const [formData, setFormData] = useState<SlotFormData>({
    date: '',
    startTime: '',
    endTime: ''
  });

  const { successToast, errorToast } = useToaster();

  // Handle form input changes
  const handleInputChange = (field: keyof SlotFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  useEffect(() => {
    if (isSuccess) {
      successToast("Time slot created successfully!");
      setFormData({
        date: '',
        startTime: '',
        endTime: ''
      });
    }
    
    if (isError && error) {
      errorToast(`Error: ${error.message}`);
    }
  }, [isSuccess, isError, error]);

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    if (!formData.date) {
      errorToast("Please select a date");
      return;
    }
    
    if (!formData.startTime) {
      errorToast("Please select a start time");
      return;
    }
    
    if (!formData.endTime) {
      errorToast("Please select an end time");
      return;
    }
    
    // Validate end time is after start time
    if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
      errorToast("End time must be after start time");
      return;
    }
    
    onSubmit(formData);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="animate-fade-in">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-4">
          <div>
            <CalendarModal
              id="date"
              name="date"
              value={formData.date}
              onChange={(value) => handleInputChange('date', value)}
              label="Date"
              className="w-full"
            />
          </div>
          
          <div>
            <TimePicker
              id="startTime"
              name="startTime"
              value={formData.startTime}
              onChange={(value) => handleInputChange('startTime', value)}
              label="Start Time"
              selectedDate={formData.date} // Pass selected date
            />
          </div>
          
          <div>
            <TimePicker
              id="endTime"
              name="endTime"
              value={formData.endTime}
              onChange={(value) => handleInputChange('endTime', value)}
              label="End Time"
              selectedDate={formData.date} // Pass selected date
            />
          </div>
        </div>

        {formData.date && formData.startTime && formData.endTime && (
          <div className="p-3 mt-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
            <h3 className="font-medium text-purple-700 dark:text-purple-300 mb-1 text-sm">Slot Summary</h3>
            <p className="text-xs text-gray-700 dark:text-gray-300">
              <span className="font-medium">Date:</span> {formatDate(formData.date)}
            </p>
            <p className="text-xs text-gray-700 dark:text-gray-300">
              <span className="font-medium">Time:</span> {formData.startTime} - {formData.endTime}
            </p>
          </div>
        )}

        <div className="pt-2">
          <Button
            type="submit"
            disabled={isSubmitting || !formData.date || !formData.startTime || !formData.endTime}
            className={cn(
              "w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 text-white font-medium rounded-xl transition-all shadow-md hover:shadow-lg",
              isSubmitting && "opacity-70 cursor-not-allowed"
            )}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating...
              </span>
            ) : "Create New Time Slot"}
          </Button>
        </div>
      </form>
    </div>
  );
};