import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useToaster } from '@/hooks/ui/useToaster';
import { CalendarModal } from './DatePicker';
import { TimePicker } from './TimePicker';
import { RuleBasedSlotInput, Weekday } from '@/types/Slot';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface RuleBasedSlotFormProps {
  onSubmit: (data: RuleBasedSlotInput) => void;
  isSubmitting: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: any;
  trainerId: string;
}

const weekdays: { id: Weekday; label: string }[] = [
  { id: 'monday', label: 'Monday' },
  { id: 'tuesday', label: 'Tuesday' },
  { id: 'wednesday', label: 'Wednesday' },
  { id: 'thursday', label: 'Thursday' },
  { id: 'friday', label: 'Friday' },
  { id: 'saturday', label: 'Saturday' },
  { id: 'sunday', label: 'Sunday' },
];

export const RuleBasedSlotForm: React.FC<RuleBasedSlotFormProps> = ({
  onSubmit,
  isSubmitting,
  isSuccess,
  isError,
  error,
  trainerId,
}) => {
  const [formData, setFormData] = useState<RuleBasedSlotInput>({
    trainerId,
    rules: {},
    fromDate: '',
    toDate: '',
    slotDurationInMinutes: 30, // Fixed to 30 minutes
  });

  const { successToast, errorToast } = useToaster();
  // Handle form input changes
  const handleInputChange = (field: keyof RuleBasedSlotInput, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle weekday rule changes
  const handleRuleChange = (weekday: Weekday, field: 'start' | 'end', value: string) => {
    setFormData((prev) => ({
      ...prev,
      rules: {
        ...prev.rules,
        [weekday]: {
          ...prev.rules[weekday],
          [field]: value,
        },
      },
    }));
  };

  // Handle weekday selection
  const handleWeekdayToggle = (weekday: Weekday, checked: boolean) => {
    setFormData((prev) => {
      const newRules = { ...prev.rules };
      if (checked) {
        newRules[weekday] = { start: '', end: '' };
      } else {
        delete newRules[weekday];
      }
      return { ...prev, rules: newRules };
    });
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form data
    if (!formData.fromDate) {
      errorToast('Please select a start date');
      return;
    }
    if (!formData.toDate) {
      errorToast('Please select an end date');
      return;
    }
    if (new Date(formData.fromDate) > new Date(formData.toDate)) {
      errorToast('End date must be after start date');
      return;
    }
    if (Object.keys(formData.rules).length === 0) {
      errorToast('Please select at least one weekday with valid times');
      return;
    }
    for (const [weekday, times] of Object.entries(formData.rules)) {
      if (!times.start || !times.end) {
        errorToast(`Please set start and end times for ${weekday}`);
        return;
      }
      if (times.start >= times.end) {
        errorToast(`End time must be after start time for ${weekday}`);
        return;
      }
    }

    // Ensure slotDurationInMinutes is set to 30
    const submitData = {
      ...formData,
      slotDurationInMinutes: 30,
    };

    onSubmit(submitData);
  };

  // Reset form on success
  useEffect(() => {
    if (isSuccess) {
      successToast('Rule-based slots created successfully!');
      setFormData({
        trainerId,
        rules: {},
        fromDate: '',
        toDate: '',
        slotDurationInMinutes: 30, // Fixed to 30 minutes
      });
    }
    if (isError && error) {
      errorToast(`Error: ${error.message}`);
    }
  }, [isSuccess, isError, error, trainerId]);

  return (
    <div className="animate-fade-in">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-4">
          <div>
            <CalendarModal
              id="fromDate"
              name="fromDate"
              value={formData.fromDate}
              onChange={(value) => handleInputChange('fromDate', value)}
              label="Start Date"
              className="w-full"
            />
          </div>
          <div>
            <CalendarModal
              id="toDate"
              name="toDate"
              value={formData.toDate}
              onChange={(value) => handleInputChange('toDate', value)}
              label="End Date"
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">
              Weekdays
            </label>
            <div className="grid grid-cols-2 gap-2">
              {weekdays.map((weekday) => (
                <div key={weekday.id} className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={weekday.id}
                      checked={!!formData.rules[weekday.id]}
                      onCheckedChange={(checked) => handleWeekdayToggle(weekday.id, checked as boolean)}
                    />
                    <Label htmlFor={weekday.id}>{weekday.label}</Label>
                  </div>
                  {formData.rules[weekday.id] && (
                    <div className="ml-6 space-y-2">
                      <TimePicker
                        id={`${weekday.id}-start`}
                        name={`${weekday.id}-start`}
                        value={formData.rules[weekday.id]?.start || ''}
                        onChange={(value) => handleRuleChange(weekday.id, 'start', value)}
                        label="Start Time"
                      />
                      <TimePicker
                        id={`${weekday.id}-end`}
                        name={`${weekday.id}-end`}
                        value={formData.rules[weekday.id]?.end || ''}
                        onChange={(value) => handleRuleChange(weekday.id, 'end', value)}
                        label="End Time"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="pt-2">
          <Button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              'w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 text-white font-medium rounded-xl transition-all shadow-md hover:shadow-lg',
              isSubmitting && 'opacity-70 cursor-not-allowed'
            )}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Creating...
              </span>
            ) : (
              'Create Recurring Slots'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};