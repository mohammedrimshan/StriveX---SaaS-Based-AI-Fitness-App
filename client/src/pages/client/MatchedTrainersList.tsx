
"use client"

import { useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useMatchedTrainers } from "@/hooks/client/useMatchedTrainers"
import { useSelectTrainer } from "@/hooks/client/useSelectTrainer"
import { Button } from "@/components/ui/button"
import { useToaster } from "@/hooks/ui/useToaster"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Loader2, Star, ChevronLeft, ChevronRight, User } from "lucide-react"
import { TrainerProfile } from "@/types/trainer"
import { MatchedTrainersResponse } from "@/services/client/clientService"
import AnimatedBackground from "@/components/Animation/AnimatedBackgorund"
import AnimatedTitle from "@/components/Animation/AnimatedTitle"
import { motion } from "framer-motion"

// Helper to format camelCase values to display format
const formatValueForDisplay = (value: string): string => {
  return value.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())
}

// Transform API data to UI format
const transformTrainerData = (apiTrainer: TrainerProfile): TrainerProfile => {
  console.log(apiTrainer, 'apiTrainer');
  return {
    id: apiTrainer.id,
    firstName: apiTrainer.firstName,
    lastName: apiTrainer.lastName,
    email: apiTrainer.email,
    phoneNumber: apiTrainer.phoneNumber,
    profileImage: apiTrainer.profileImage,
    bio: `Experienced trainer with ${apiTrainer.experience} years of professional training.`,
    location: "Local Area",
    experience: apiTrainer.experience,
    rating: apiTrainer.rating || 4.5, // Use API rating if available
    clientCount: apiTrainer.clientCount || 0,
    sessionCount: 50,
    specialization: apiTrainer.specialization || [],
    certifications: apiTrainer.certifications || [],
    qualifications: apiTrainer.qualifications || [],
    skills: apiTrainer.skills || [],
    availability: ["Monday", "Wednesday", "Friday"],
    height: apiTrainer.height,
    weight: apiTrainer.weight,
    gender: apiTrainer.gender,
    approvedByAdmin: apiTrainer.approvedByAdmin,
  }
}

export default function MatchedTrainersPage() {
  const navigate = useNavigate()
  const { successToast, errorToast } = useToaster()
  const { data: apiResponse, isLoading, isError } = useMatchedTrainers()
  const { mutate: selectTrainer, isPending } = useSelectTrainer()
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)

  const trainers = (apiResponse as MatchedTrainersResponse | undefined)?.success &&
    Array.isArray((apiResponse as MatchedTrainersResponse | undefined)?.data)
    ? (apiResponse as MatchedTrainersResponse).data.map(transformTrainerData)
    : []

  const [selectedTrainerId, setSelectedTrainerId] = useState<string | null>(null)

  const handleSelectTrainer = (id: string) => {
    setSelectedTrainerId(id)
  }

  const handleConfirmSelection = () => {
    if (!selectedTrainerId) {
      errorToast("Please select a trainer first")
      return
    }

    selectTrainer(selectedTrainerId, {
      onSuccess: () => {
        successToast("Trainer selected successfully!")
        navigate("/home")
      },
      onError: () => {
        errorToast("Failed to select trainer. Please try again.")
      },
    })
  }

  const handleGoBack = () => {
    navigate(-1)
  }

  const renderRatingStars = (rating: number) => {
    const stars = []
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star key={i} size={16} className={i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} />,
      )
    }
    return <div className="flex">{stars}</div>
  }

  const getMatchPercentage = (trainerId: string) => {
    const hash = trainerId.split("").reduce((acc, char) => {
      return acc + char.charCodeAt(0)
    }, 0)
    return Math.round(75 + (hash % 20))
  }

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: "smooth" })
    }
  }

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: "smooth" })
    }
  }

  if (isLoading) {
    return (
      <AnimatedBackground>
        <div className="container flex items-center justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Finding the best trainers for you...</span>
        </div>
      </AnimatedBackground>
    )
  }

  if (isError) {
    return (
      <AnimatedBackground>
        <div className="container py-16">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6 text-center">
              <p className="mb-4">Sorry, we couldn't load matched trainers. Please try again.</p>
              <Button onClick={handleGoBack}>Go Back</Button>
            </CardContent>
          </Card>
        </div>
      </AnimatedBackground>
    )
  }

  return (
    <AnimatedBackground>
      <div className="container py-8 max-w-7xl mx-auto">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" onClick={handleGoBack} className="flex items-center z-10">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Preferences
          </Button>
        </div>

        <AnimatedTitle
          title="Your Perfect Match"
          subtitle="We've found trainers who match your fitness goals and preferences. Select one to begin your journey."
        />

        {trainers.length === 0 ? (
          <Card className="max-w-md mx-auto backdrop-blur-sm bg-white/90">
            <CardContent className="pt-6 text-center">
              <p className="mb-4">
                No trainers matched your preferences. Please adjust your preferences and try again.
              </p>
              <Button onClick={handleGoBack}>Update Preferences</Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="relative max-w-full mx-auto mb-8">
              <Button
                variant="outline"
                size="icon"
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 rounded-full shadow-md hidden md:flex"
                onClick={scrollLeft}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 rounded-full shadow-md hidden md:flex"
                onClick={scrollRight}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>

              <div
                ref={scrollContainerRef}
                className="flex justify-center overflow-x-auto pb-4 gap-6 scroll-smooth hide-scrollbar snap-x"
                style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
              >
                {trainers.map((trainer: TrainerProfile) => (
                  <motion.div
                    key={trainer.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="snap-center"
                  >
                    <Card
                      className={`cursor-pointer transition-all w-[320px] h-[500px] backdrop-blur-sm bg-white/90 hover:shadow-xl ${
                        selectedTrainerId === trainer.id
                          ? "ring-2 ring-primary shadow-lg scale-[1.02] border-blue-400"
                          : "hover:shadow-md hover:scale-[1.01]"
                      }`}
                      onClick={() => handleSelectTrainer(trainer.id)}
                    >
                      <CardContent className="p-6 flex flex-col h-full">
                        <div className="flex flex-col items-center mb-4">
                          <div className="relative">
                            <Avatar className="h-24 w-24 ring-4 ring-indigo-100 mb-3">
                              <AvatarImage
                                src={trainer.profileImage || "/placeholder.svg"}
                                alt={`${trainer.firstName} ${trainer.lastName}`}
                              />
                              <AvatarFallback className="bg-indigo-100 text-indigo-700">
                                <User className="h-12 w-12" />
                              </AvatarFallback>
                            </Avatar>
                            <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-0">
                              {getMatchPercentage(trainer.id)}% Match
                            </Badge>
                          </div>
                          <h3 className="font-bold text-xl text-gray-800 text-center">{`${trainer.firstName} ${trainer.lastName}`}</h3>

                          <div className="flex items-center gap-1 mt-1">
                            {renderRatingStars(trainer.rating)}
                            <span className="text-sm text-muted-foreground ml-1">({trainer.rating.toFixed(1)})</span>
                          </div>

                          <p className="text-sm text-muted-foreground">{trainer.experience} years experience</p>
                        </div>

                        <div className="mt-4 flex-grow overflow-y-auto pr-2 custom-scrollbar">
                          <p className="text-sm mb-3 text-gray-700">{trainer.bio}</p>

                          {trainer.specialization?.length > 0 && (
                            <div className="mb-3">
                              <p className="text-sm font-medium mb-1 text-gray-800">Specialization:</p>
                              <div className="flex flex-wrap gap-2">
                                {trainer.specialization.map((spec: string, index: number) => (
                                  <Badge
                                    key={index}
                                    variant="secondary"
                                    className="text-xs bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700"
                                  >
                                    {formatValueForDisplay(spec)}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {trainer.skills?.length > 0 && (
                            <div className="mt-2">
                              <p className="text-sm font-medium mb-1 text-gray-800">Skills:</p>
                              <div className="flex flex-wrap gap-2">
                                {trainer.skills.map((skill: string, index: number) => (
                                  <Badge
                                    key={index}
                                    variant="outline"
                                    className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                                  >
                                    {formatValueForDisplay(skill)}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>

            <motion.div
              className="flex justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <Button
                onClick={handleConfirmSelection}
                size="lg"
                disabled={!selectedTrainerId || isPending}
                className="px-8 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Selecting...
                  </>
                ) : (
                  "Confirm Selection"
                )}
              </Button>
            </motion.div>
          </>
        )}
      </div>
    </AnimatedBackground>
  )
}
