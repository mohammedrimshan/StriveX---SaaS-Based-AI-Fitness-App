import React, { useState, useEffect } from 'react';
import { useCreateSlot, useTrainerOwnSlots } from '@/hooks/slot/useSlotQueries';
import { useQueryClient } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import AnimatedBackground from '@/components/Animation/AnimatedBackgorund';
import AnimatedTitle from '@/components/Animation/AnimatedTitle';
import { SlotForm } from './SlotForm';
import { useCreateSlotsFromRuleMutation } from '@/hooks/slot/useCreateSlotsFromRuleMutation';
import { RuleBasedSlotForm } from './RuleBasedSlotForm';
import { SlotList } from './SlotList';
import { useToaster } from '@/hooks/ui/useToaster';
import { Pagination } from '@/components/common/Pagination/Pagination';
import { Calendar, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CalendarModal } from './DatePicker';
import { SlotFilter, SlotFormData, RuleBasedSlotInput } from '@/types/Slot';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const TrainerSlotPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: slots, isLoading, error } = useTrainerOwnSlots();
  const createSlotMutation = useCreateSlot();
  const createSlotsFromRuleMutation = useCreateSlotsFromRuleMutation();
  const { successToast, errorToast } = useToaster();

  // State for active tab
  const [activeTab, setActiveTab] = useState('single');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(2);

  // Filter state
  const [filters, setFilters] = useState<SlotFilter>({
    date: '',
    status: 'all',
  });

  // Modal state for filters
  const [filterModalOpen, setFilterModalOpen] = useState(false);

  // Handle single slot submission
  const handleSubmitSlot = (formData: SlotFormData) => {
    createSlotMutation.mutate(formData, {
      onSuccess: () => {
        successToast('Slot created successfully!');
        queryClient.invalidateQueries({ queryKey: ['trainerOwnSlots'] });
      },
      onError: (error: any) => {
        errorToast(error.message || 'Failed to create slot');
      },
    });
  };

  // Handle rule-based slot submission
  const handleSubmitRuleBasedSlot = (formData: RuleBasedSlotInput) => {
    createSlotsFromRuleMutation.mutate(formData, {
      onSuccess: () => {
        successToast('Recurring slots created successfully!');
        queryClient.invalidateQueries({ queryKey: ['trainerOwnSlots'] });
      },
      onError: (error: any) => {
        errorToast(error.message || 'Failed to create recurring slots');
      },
    });
  };

  // Filter slots based on criteria
  const filteredSlots = slots?.slots
    ? slots.slots.filter((slot) => {
        if (filters.date && slot.date !== filters.date) {
          return false;
        }
        if (filters.status === 'available' && !slot.isAvailable) {
          return false;
        }
        if (filters.status === 'booked' && !slot.isBooked) {
          return false;
        }
        return true;
      })
    : [];

  // Calculate pagination
  const totalPages = Math.ceil((filteredSlots?.length || 0) / itemsPerPage);
  const currentItems = filteredSlots?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = (field: keyof SlotFilter, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      date: '',
      status: 'all',
    });
    setFilterModalOpen(false);
  };

  return (
    <AnimatedBackground>
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="mt-6 mb-10">
          <AnimatedTitle
            title="Manage Your Schedule"
            subtitle="Create and manage your availability time slots for clients to book sessions"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 sticky top-24">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="single">Single Slot</TabsTrigger>
                  <TabsTrigger value="recurring">Recurring Slots</TabsTrigger>
                </TabsList>
                <TabsContent value="single">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center mb-6">
                    <span className="bg-gradient-to-r from-indigo-600 to-purple-600 w-2 h-8 rounded mr-3"></span>
                    Create New Time Slot
                  </h2>
                  <SlotForm
                    onSubmit={handleSubmitSlot}
                    isSubmitting={createSlotMutation.isPending}
                    isSuccess={createSlotMutation.isSuccess}
                    isError={createSlotMutation.isError}
                    error={createSlotMutation.error as { message: string }}
                  />
                </TabsContent>
                <TabsContent value="recurring">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center mb-6">
                    <span className="bg-gradient-to-r from-indigo-600 to-purple-600 w-2 h-8 rounded mr-3"></span>
                    Create Recurring Slots
                  </h2>
                  <RuleBasedSlotForm
                    onSubmit={handleSubmitRuleBasedSlot}
                    isSubmitting={createSlotsFromRuleMutation.isPending}
                    isSuccess={createSlotsFromRuleMutation.isSuccess}
                    isError={createSlotsFromRuleMutation.isError}
                    error={createSlotsFromRuleMutation.error}
                    trainerId="trainer-id-placeholder"
                  />
                </TabsContent>
              </Tabs>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6">
              <div className="flex flex-wrap items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center mb-4 md:mb-0">
                  <span className="bg-gradient-to-r from-indigo-600 to-purple-600 w-2 h-8 rounded mr-3"></span>
                  My Time Slots
                </h2>
                <div className="flex items-center space-x-2">
                  <div className="hidden md:flex space-x-2">
                    <Button
                      variant={filters.status === 'all' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleFilterChange('status', 'all')}
                      className={filters.status === 'all' ? 'bg-indigo-600' : ''}
                    >
                      All
                    </Button>
                    <Button
                      variant={filters.status === 'available' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleFilterChange('status', 'available')}
                      className={filters.status === 'available' ? 'bg-green-600' : ''}
                    >
                      Available
                    </Button>
                    <Button
                      variant={filters.status === 'booked' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleFilterChange('status', 'booked')}
                      className={filters.status === 'booked' ? 'bg-blue-600' : ''}
                    >
                      Booked
                    </Button>
                  </div>
                  <Dialog open={filterModalOpen} onOpenChange={setFilterModalOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="icon" className="h-10 w-10">
                        <Filter size={18} />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Filter Time Slots</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Date</label>
                          <CalendarModal
                            id="filter-date"
                            name="filter-date"
                            value={filters.date}
                            onChange={(value) => handleFilterChange('date', value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Status</label>
                          <div className="flex space-x-2">
                            <Button
                              variant={filters.status === 'all' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => handleFilterChange('status', 'all')}
                              className="flex-1"
                            >
                              All
                            </Button>
                            <Button
                              variant={filters.status === 'available' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => handleFilterChange('status', 'available')}
                              className='flex-1'
                            >
                              Available
                            </Button>
                            <Button
                              variant={filters.status === 'booked' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => handleFilterChange('status', 'booked')}
                              className="flex-1"
                            >
                              Booked
                            </Button>
                          </div>
                        </div>
                        <Button variant="outline" onClick={clearFilters} className="w-full">
                          Clear Filters
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              {(filters.date || filters.status !== 'all') && (
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <span className="text-sm text-gray-500">Active filters:</span>
                  {filters.date && (
                    <div className="bg-indigo-100 text-indigo-800 text-xs px-3 py-1 rounded-full flex items-center">
                      <Calendar size={12} className="mr-1" />
                      {new Date(filters.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                      <button
                        className="ml-2 text-indigo-600 hover:text-indigo-800"
                        onClick={() => handleFilterChange('date', '')}
                      >
                        &times;
                      </button>
                    </div>
                  )}
                  {filters.status !== 'all' && (
                    <div
                      className={`${
                        filters.status === 'available'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      } text-xs px-3 py-1 rounded-full`}
                    >
                      {filters.status.charAt(0).toUpperCase() + filters.status.slice(1)}
                      <button
                        className={`ml-2 ${
                          filters.status === 'available'
                            ? 'text-green-600 hover:text-green-800'
                            : 'text-blue-600 hover:text-blue-800'
                        }`}
                        onClick={() => handleFilterChange('status', 'all')}
                      >
                        &times;
                      </button>
                    </div>
                  )}
                  <button
                    className="text-xs text-gray-500 hover:text-gray-700 underline ml-auto"
                    onClick={clearFilters}
                  >
                    Clear all
                  </button>
                </div>
              )}
              <SlotList slots={currentItems} isLoading={isLoading} error={error} />
              {!isLoading && !error && filteredSlots.length > 0 && (
                <div className="mt-6">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Toaster position="top-right" />
    </AnimatedBackground>
  );
};

export default TrainerSlotPage;