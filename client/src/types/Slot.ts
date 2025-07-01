export interface ISlot {
  id: string;
  trainerId: string;
  trainerName: string;
  clientId?: string;
  client?: {
    clientId: string;
    name: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    profileImage?: string;
  };
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  isBooked: boolean;
  status: 'AVAILABLE' | 'BOOKED' | 'CANCELLED' | 'COMPLETED';
  createdAt: string;
  updatedAt: string;
  clientName?: string;
  videoCallStatus?: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'FAILED';
  videoCallRoomName?: string;
  cancellationReason?: string;
}
  export interface UserBookingsResponse {
    success: boolean;
    bookings: ISlot[];
    message?: string;
  }
  
  export interface SlotsResponse {
    success: boolean;
    slots: ISlot[];
    message?: string;
  }
  
  export interface BookSlotData {
    slotId: string;
  }
  
  export interface CancelSlotData {
    slotId: string;
    cancellationReason?:string;
  }
  
  export interface CreateSlotData {
    startTime: string;
    endTime: string;
  }

  // Define SlotFilter interface
export interface SlotFilter {
  date: string;
  status: 'all' | 'available' | 'booked';
}


export interface CalendarModalProps {
  id: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  label?: string;
  className?: string;
}


export interface SlotCardProps {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
  isAvailable: boolean;
  status?: string;
  clientId?: string;
  clientName?: string;
}


export interface SlotFormProps {
  onSubmit: (formData: SlotFormData) => void;
  isSubmitting: boolean;
  isSuccess: boolean;
  isError: boolean;
  error?: { message: string };
}

export interface SlotFormData {
  date: string;
  startTime: string;
  endTime: string;
}


export interface CancelSlotResponse {
  success: boolean;
  message: string;
  slot: ISlot;
}

export type Weekday =
  | "sunday"
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday";

export interface RuleBasedSlotInput {
  trainerId: string;
  rules: Partial<Record<Weekday, { start: string; end: string }>>;
  fromDate: string; // "YYYY-MM-DD"
  toDate: string;   // "YYYY-MM-DD"
  slotDurationInMinutes?: number;
}
