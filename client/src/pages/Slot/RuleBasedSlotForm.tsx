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
    slotDurationInMinutes: 30, 
  });

  const { successToast, errorToast } = useToaster();

  const handleInputChange = (field: keyof RuleBasedSlotInput, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

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

const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startDate = new Date(formData.fromDate);
  const endDate = new Date(formData.toDate);

  if (!formData.fromDate) {
    errorToast('Please select a start date');
    return;
  }
  if (!formData.toDate) {
    errorToast('Please select an end date');
    return;
  }
  if (startDate > endDate) {
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

  const dayMap: { [key: string]: number } = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  };

  for (const weekday in formData.rules) {
    const weekdayIndex = dayMap[weekday.toLowerCase()];
    let datePointer = new Date(startDate);
    let isWeekdayInRangeAndFuture = false;

    while (datePointer <= endDate) {
      if (datePointer.getDay() === weekdayIndex) {
        const currentDay = new Date(datePointer);
        currentDay.setHours(0, 0, 0, 0);

        if (currentDay >= today) {
          isWeekdayInRangeAndFuture = true;
          break;
        }
      }
      datePointer.setDate(datePointer.getDate() + 1);
    }

    if (!isWeekdayInRangeAndFuture) {
      errorToast(
        `Cannot create slots for ${weekday.charAt(0).toUpperCase() + weekday.slice(1)} – it's either already passed or not in the selected date range.`
      );
      return;
    }
  }

  const submitData = {
    ...formData,
    slotDurationInMinutes: 30,
  };

  onSubmit(submitData);
};

  useEffect(() => {
    if (isSuccess) {
      successToast('Rule-based slots created successfully!');
      setFormData({
        trainerId,
        rules: {},
        fromDate: '',
        toDate: '',
        slotDurationInMinutes: 30, 
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