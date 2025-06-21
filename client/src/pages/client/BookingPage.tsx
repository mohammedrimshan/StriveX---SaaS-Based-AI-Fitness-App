"use client"

import { useState, useEffect } from "react"
import { SlotList } from "./SlotManagement/SlotList"
import { format, isAfter, startOfDay } from "date-fns"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { SlotFilter } from "@/types/Slot"
import { useToaster } from "@/hooks/ui/useToaster"
import { Loader2, Info, CalendarIcon, Clock, Filter, Calendar } from "lucide-react"
import { useTrainerSlots } from "@/hooks/slot/useTrainerSlots"
import { useBookSlot } from "@/hooks/slot/useBookSlot"
import { useUserBookings } from "@/hooks/slot/useUserBookings"
import AnimatedTitle from "@/components/Animation/AnimatedTitle"
import EmptyStateAnimation from "@/components/Animation/EmptyStateAnimation"
import { CustomCalendar } from "@/pages/client/SlotManagement/CustomCalendar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { motion } from "framer-motion"
import { UserBookings } from "./SlotManagement/UserBookings"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AnimatedBackground from "@/components/Animation/AnimatedBackgorund"
import { useSelector } from "react-redux"
import type { RootState } from "@/store/store"
import { useClientProfile } from "@/hooks/client/useClientProfile"
import { useNavigate } from "react-router-dom"

interface BookingPageProps {
  trainerId?: string
}

export default function BookingPage({ trainerId }: BookingPageProps) {
  const navigate = useNavigate()
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [filter, setFilter] = useState<SlotFilter>({
    date: format(new Date(), "yyyy-MM-dd"),
    status: "all",
  })
  const [trainerName, setTrainerName] = useState<string>("Your Trainer")
  const [activeTab, setActiveTab] = useState<string>("book")

  // Initialize toast
  const { successToast, errorToast } = useToaster()

  // Get client data from Redux store
  const { client } = useSelector((state: RootState) => ({
    client: state.client.client,
  }))

  // Get client profile to check premium status
  const { data: clientProfile, isLoading: profileLoading, error: profileError } = useClientProfile(client?.id || null)

  // Get trainer slots
  const { data: slotsData, isLoading: slotsLoading, isError: slotsError, refetch: refetchSlots } = useTrainerSlots()

  // Get user bookings
  const {
    data: userBookingsData,
    isLoading: bookingsLoading,
    isError: bookingsError,
    refetch: refetchBookings,
  } = useUserBookings()

  // Book a slot
  const {
    mutate: bookSlot,
    isPending: bookingInProgress,
    isSuccess: bookingSuccess,
    isError: bookingError,
    error: bookingErrorData,
  } = useBookSlot()

  // Generate dates with available slots for the dot indicator
  const datesWithSlots =
    slotsData?.slots?.reduce((acc: Date[], slot) => {
      if (slot.isAvailable && !slot.isBooked) {
        const [year, month, day] = slot.date.split("-").map(Number)
        acc.push(new Date(year, month - 1, day))
      }
      return acc
    }, []) || []

  // Filter slots based on selected date and status
  const filteredSlots =
    slotsData?.slots?.filter((slot) => {
      const matchesDate = slot.date === filter.date

      if (filter.status === "all") return matchesDate
      if (filter.status === "available") return matchesDate && slot.isAvailable && !slot.isBooked
      if (filter.status === "booked") return matchesDate && slot.isBooked

      return matchesDate
    }) || []

  // Sort user bookings by date (most recent first)
  const sortedUserBookings = userBookingsData?.bookings
    ? [...userBookingsData.bookings].sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.startTime}`)
        const dateB = new Date(`${b.date}T${b.startTime}`)
        return dateA.getTime() - dateB.getTime()
      })
    : []

  // Get upcoming bookings
  const upcomingBookings = sortedUserBookings.filter((booking) => {
    const [year, month, day] = booking.date.split("-").map(Number)
    const [hour, minute] = booking.startTime.split(":").map(Number)
    const bookingDate = new Date(year, month - 1, day, hour, minute)
    return bookingDate >= new Date()
  })

  // Update filter when date changes
  useEffect(() => {
    setFilter((prev) => ({
      ...prev,
      date: format(selectedDate, "yyyy-MM-dd"),
    }))
    setSelectedSlot(null)
  }, [selectedDate])

  // Handle success/error from booking
  useEffect(() => {
    if (bookingSuccess) {
      successToast("Your booking has been confirmed")
      setSelectedSlot(null)
      refetchSlots()
      refetchBookings()
      setActiveTab("bookings")
    }

    if (bookingError && bookingErrorData) {
      errorToast(bookingErrorData?.message || "Something went wrong")
    }
  }, [bookingSuccess, bookingError, bookingErrorData, refetchSlots, refetchBookings, successToast, errorToast])

  // Extract trainer name from slots data when available
  useEffect(() => {
    if (slotsData?.slots && slotsData.slots.length > 0) {
      const anyTrainerSlot = slotsData.slots.find((slot) => slot.trainerName)
      if (anyTrainerSlot && anyTrainerSlot.trainerName) {
        setTrainerName(anyTrainerSlot.trainerName)
      }
    }
  }, [slotsData, trainerId])

  // Handle slot selection
  const handleSelectSlot = (slotId: string) => {
    setSelectedSlot(slotId)
  }

  // Handle booking confirmation
  const handleBooking = () => {
    if (!selectedSlot) return
    bookSlot({ slotId: selectedSlot })
  }

  const todayStart = startOfDay(new Date())

  // Handle profile errors or no user
  if (profileError || !client) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg">
          <div className="text-5xl mb-4">👋</div>
          <h2 className="text-2xl font-semibold text-slate-800 mb-2">Welcome</h2>
          <p className="text-slate-600">{profileError?.message || "Please log in to access bookings"}</p>
        </div>
      </div>
    )
  }

  // Check if user is premium and has accepted status
  if (profileLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-t-violet-500 border-violet-200 rounded-full animate-spin mb-4"></div>
          <p className="text-slate-600 font-medium">Checking your account...</p>
        </div>
      </div>
    )
  }

  if (clientProfile && (!clientProfile.isPremium || clientProfile.selectStatus !== "accepted")) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-slate-50/50 backdrop-blur-sm z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center p-8 bg-white rounded-xl shadow-2xl max-w-md border border-violet-100"
        >
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-2xl font-semibold text-slate-800 mb-2">Premium Feature</h2>
          <p className="text-slate-600 mb-6">
            Please select a trainer and upgrade to premium to access booking features
          </p>
          <Button
            onClick={() => navigate('/premium')} 
            className="px-6 py-3 bg-gradient-to-r from-[#6d28d9] to-[#a21caf] hover:from-[#5b21b6] hover:to-[#86198f] text-white rounded-lg transition-all transform hover:scale-105"
          >
            Upgrade to Premium
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <AnimatedBackground>
      <div className="container mx-auto p-4 pt-20">
        <AnimatedTitle
          title={`Book a Session with ${trainerName}`}
          subtitle="Choose a convenient time for your appointment"
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="md:col-span-1"
          >
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 transition-all hover:shadow-2xl border border-violet-100">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                  <CalendarIcon className="h-5 w-5 mr-2 text-violet-600" />
                  Select Date
                </h2>
                <div className="relative z-10">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="relative">
                          <Select
                            value={filter.status}
                            onValueChange={(value) =>
                              setFilter((prev) => ({ ...prev, status: value as "all" | "available" | "booked" }))
                            }
                          >
                            <SelectTrigger className="w-32 bg-white border-violet-200 hover:border-violet-400 transition-colors h-8 px-2 text-xs">
                              <div className="flex items-center">
                                <Filter className="h-3 w-3 mr-1 text-violet-600" />
                                <SelectValue placeholder="Filter" />
                              </div>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All slots</SelectItem>
                              <SelectItem value="available">Available only</SelectItem>
                              <SelectItem value="booked">Booked only</SelectItem>
                            </SelectContent>
                          </Select>
                          <motion.div
                            animate={{
                              scale: [1, 1.2, 1],
                              opacity: [0.7, 1, 0.7],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Number.POSITIVE_INFINITY,
                              repeatType: "reverse",
                            }}
                            className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-violet-600"
                          />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Filter slots by availability</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              <div className="mb-4">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <motion.div
                          animate={{
                            scale: [1, 1.2, 1],
                            backgroundColor: ["#8B5CF6", "#6366F1", "#8B5CF6"],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Number.POSITIVE_INFINITY,
                            repeatType: "reverse",
                          }}
                          className="h-3 w-3 rounded-full bg-violet-500 mr-2"
                        />
                        <span>Available slots</span>
                        <Info className="h-4 w-4 ml-1 text-gray-400" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Dates with violet dots have available booking slots</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <CustomCalendar
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                datesWithSlots={datesWithSlots}
                disabledDates={(date) => !isAfter(date, todayStart)}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="md:col-span-2"
          >
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-6 transition-all hover:shadow-2xl border border-blue-100">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6 p-1 bg-gray-100 rounded-full">
                  <TabsTrigger
                    value="book"
                    className="flex items-center gap-2 py-3 rounded-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#6d28d9] data-[state=active]:to-[#a21caf] data-[state=active]:text-white transition-all duration-300"
                  >
                    <motion.div
                      initial={{ scale: 1 }}
                      animate={{ scale: activeTab === "book" ? [1, 1.2, 1] : 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                    </motion.div>
                    Book New Session
                  </TabsTrigger>
                  <TabsTrigger
                    value="bookings"
                    className="flex items-center gap-2 py-3 rounded-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#e11d48] data-[state=active]:to-[#f97316] data-[state=active]:text-white transition-all duration-300"
                  >
                    <motion.div
                      initial={{ scale: 1 }}
                      animate={{ scale: activeTab === "bookings" ? [1, 1.2, 1] : 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Clock className="h-4 w-4 mr-2" />
                    </motion.div>
                    Manage Bookings
                    {upcomingBookings.length > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="ml-2 bg-gradient-to-r from-violet-600 to-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                      >
                        {upcomingBookings.length}
                      </motion.span>
                    )}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="book" className="mt-0" asChild>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
                      <Clock className="h-5 w-5 mr-2 text-violet-600" />
                      Available Slots for {format(selectedDate, "MMMM d, yyyy")}
                    </h2>

                    {slotsLoading ? (
                      <div className="flex items-center justify-center min-h-64">
                        <motion.div
                          animate={{
                            rotate: 360,
                            boxShadow: [
                              "0 0 0 rgba(139, 92, 246, 0)",
                              "0 0 20px rgba(139, 92, 246, 0.5)",
                              "0 0 0 rgba(139, 92, 246, 0)",
                            ],
                          }}
                          transition={{
                            rotate: { duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
                            boxShadow: { duration: 2, repeat: Number.POSITIVE_INFINITY },
                          }}
                          className="p-3 rounded-full"
                        >
                          <Loader2 className="w-10 h-10 text-violet-600" />
                        </motion.div>
                      </div>
                    ) : slotsError ? (
                      <div className="text-center p-8">
                        <p className="text-red-500 mb-4">Failed to load available slots</p>
                        <Button
                          onClick={() => refetchSlots()}
                          className="bg-gradient-to-r from-[#6d28d9] to-[#a21caf] hover:from-[#5b21b6] hover:to-[#86198f] text-white"
                        >
                          Try Again
                        </Button>
                      </div>
                    ) : filteredSlots.length === 0 ? (
                      <EmptyStateAnimation
                        message="No slots available for the selected date"
                        subMessage="Please select another date or change your filter options"
                      />
                    ) : (
                      <>
                        <SlotList slots={filteredSlots} selectedSlot={selectedSlot} onSelectSlot={handleSelectSlot} />

                        {selectedSlot && (
                          <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-8 flex justify-end"
                          >
                            <Button
                              onClick={handleBooking}
                              disabled={bookingInProgress}
                              className="bg-gradient-to-r from-[#6d28d9] to-[#a21caf] hover:from-[#5b21b6] hover:to-[#86198f] text-white px-6 py-6 rounded-xl transition-all transform hover:scale-105 shadow-lg hover:shadow-xl relative overflow-hidden group"
                            >
                              <span className="absolute inset-0 w-full h-full bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
                              {bookingInProgress ? (
                                <>
                                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                  Processing...
                                </>
                              ) : (
                                "Confirm Booking"
                              )}
                            </Button>
                          </motion.div>
                        )}
                      </>
                    )}
                  </motion.div>
                </TabsContent>

                <TabsContent value="bookings" className="mt-0" asChild>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h2 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
                      <Clock className="h-5 w-5 mr-2 text-rose-600" />
                      Manage Your Bookings
                    </h2>

                    {bookingsLoading ? (
                      <div className="flex items-center justify-center min-h-64">
                        <motion.div
                          animate={{
                            rotate: 360,
                            boxShadow: [
                              "0 0 0 rgba(225, 29, 72, 0)",
                              "0 0 20px rgba(225, 29, 72, 0.5)",
                              "0 0 0 rgba(225, 29, 72, 0)",
                            ],
                          }}
                          transition={{
                            rotate: { duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" },
                            boxShadow: { duration: 2, repeat: Number.POSITIVE_INFINITY },
                          }}
                          className="p-3 rounded-full"
                        >
                          <Loader2 className="w-10 h-10 text-rose-600" />
                        </motion.div>
                      </div>
                    ) : bookingsError ? (
                      <div className="text-center p-8">
                        <p className="text-red-500 mb-4">Please Book your Slot</p>
                        <Button
                          onClick={() => refetchBookings()}
                          className="bg-gradient-to-r from-[#e11d48] to-[#f97316] hover:from-[#be123c] hover:to-[#ea580c] text-white"
                        >
                          Book Now
                        </Button>
                      </div>
                    ) : sortedUserBookings.length === 0 ? (
                      <EmptyStateAnimation
                        message="You don't have any bookings yet"
                        subMessage="Book a session to get started"
                      />
                    ) : (
                      <div className="space-y-4">
                        <UserBookings
                          bookings={sortedUserBookings}
                          onBookingCancelled={() => {
                            refetchBookings()
                            refetchSlots()
                          }}
                        />
                      </div>
                    )}
                  </motion.div>
                </TabsContent>
              </Tabs>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatedBackground>
  )
}