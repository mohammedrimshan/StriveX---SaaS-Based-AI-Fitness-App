import React from 'react';
import { SlotCard } from './SlotCard';
import { Calendar, AlertTriangle } from 'lucide-react';
import { ISlot } from '@/types/Slot'

interface SlotListProps {
  slots?: ISlot[];
  isLoading: boolean;
  error: any;
}

export const SlotList: React.FC<SlotListProps> = ({ slots, isLoading, error }) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-12 h-12 rounded-full border-4 border-t-indigo-600 border-indigo-200 animate-spin mb-4"></div>
        <p className="text-gray-500 font-medium">Loading your slots...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 animate-fade-in">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Error loading slots
            </h3>
            <p className="mt-2 text-sm text-red-700">
              {error.message || "Please try again later."}
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  if (!slots || slots.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500 animate-fade-in">
        <Calendar size={48} className="mb-4 text-indigo-400" />
        <p className="text-lg font-medium mb-1">No slots available</p>
        <p className="text-sm">Create a new time slot or adjust your filters to see more results.</p>
      </div>
    );
  }
  
  // Group slots by date for better organization
  const slotsByDate = slots.reduce((acc, slot) => {
    const date = new Date(slot.date).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
    
    if (!acc[date]) {
      acc[date] = [];
    }
    
    acc[date].push(slot);
    return acc;
  }, {} as Record<string, ISlot[]>);
  
  return (
    <div className="space-y-8">
      {Object.entries(slotsByDate).map(([date, dateSlots], dateIndex) => (
        <div key={date} className="animate-fade-in" style={{ animationDelay: `${dateIndex * 0.1}s` }}>
          <h3 className="text-md font-semibold text-gray-700 mb-3 border-b pb-2">{date}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dateSlots.map((slot, index) => (
              <div 
                key={slot.id} 
                className="transform transition-all duration-300"
                style={{
                  opacity: 1,
                  transform: `translateY(0)`,
                  animationDelay: `${index * 0.1}s`
                }}
              >
                <SlotCard
                  id={slot.id}
                  date={slot.date}
                  startTime={slot.startTime}
                  endTime={slot.endTime}
                  isBooked={slot.isBooked}
                  isAvailable={slot.isAvailable}
                  clientId={slot.clientId}
                  clientName={slot.clientName}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};