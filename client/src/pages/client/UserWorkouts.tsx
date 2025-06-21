// UserWorkout.tsx
"use client";

import { useState } from "react";
import { Search, Filter, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import AnimatedBackground from "@/components/Animation/AnimatedBackgorund";
import WorkoutCard from "./Workouts/WorkoutCard";
import AnimatedTitle from "@/components/Animation/AnimatedTitle";
import { useAllWorkouts } from "@/hooks/client/useAllWorkouts";
import { WorkoutDetailsPro } from "@/types/Workouts";
import { PremiumModal } from "@/components/modals/PremiumModal";
import { useClientProfile } from "@/hooks/client/useClientProfile";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

export const WORKOUT_TYPES = [
  "Yoga",
  "Cardio",
  "WeightTraining",
  "Meditation",
  "Calisthenics",
  "Pilates",
  "General",
] as const;

type WorkoutCategoryTitle = typeof WORKOUT_TYPES[number];
type FilterCategory = WorkoutCategoryTitle | "All";

const categories: FilterCategory[] = [
  "All",
  "Yoga",
  "Cardio",
  "WeightTraining",
  "Meditation",
  "Calisthenics",
  "Pilates",
  "General",
];

const UserWorkout = () => {
  const [activeCategory, setActiveCategory] = useState<FilterCategory>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false); // Modal state

  // Get client ID from Redux
  const client = useSelector((state: RootState) => state.client.client);
  const { data: clientProfile, isLoading: isProfileLoading, isError: isProfileError } = useClientProfile(client?.id || null);

  // Fetch workouts using the useAllWorkouts hook
  const { data, isLoading, isError } = useAllWorkouts(1, 10, {});

  // Handle loading and error states
  if (isLoading || isProfileLoading) {
    return <div>Loading...</div>;
  }

  if (isError || !data?.data || isProfileError) {
    return <div>Error fetching data. Please try again later.</div>;
  }

  // Type workouts explicitly
  const workouts: WorkoutDetailsPro[] = data.data;

  // Filter workouts based on search query and category
  const filteredWorkouts = workouts.filter((workout) => {
    const matchesSearch =
      workout.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workout.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "All" || workout.category.title === activeCategory;
    return matchesSearch && matchesCategory;
  });

  // Function to open the premium modal
  const handlePremiumAccessAttempt = () => {
    setIsPremiumModalOpen(true);
  };

  return (
    <AnimatedBackground>
      <div className="container mx-auto px-4 py-8 pt-24">
        <AnimatedTitle
          title="Rhythm Fit Flow"
          subtitle="Combine workout videos with music to create the perfect fitness experience. Follow along with professional trainers while listening to motivating tracks."
        />

        {/* Search bar */}
        <div className="flex items-center mb-6 animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-violet-400 h-5 w-5 transition-all duration-300 animate-pulse" />
            <input
              type="text"
              placeholder="Search workouts..."
              className="w-full bg-white/10 border-2 border-violet-400/50 rounded-full py-3 pl-10 pr-4 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all duration-300"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <motion.button
            className="ml-2 p-3 rounded-full bg-violet-500/80 hover:bg-violet-600 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Filter className="h-5 w-5 text-white animate-pulse" />
          </motion.button>
        </div>

        {/* Categories */}
        <div
          className="flex overflow-x-auto pb-4 mb-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent animate-slide-up"
          style={{ animationDelay: "0.3s" }}
        >
          {categories.map((category) => (
            <button
              key={category}
              className={`px-5 py-2 rounded-full mx-1 whitespace-nowrap transition-colors ${
                activeCategory === category
                  ? "bg-fitness-purple text-gray-100"
                  : "bg-white/10 text-gray-800 hover:bg-white/20"
              }`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Featured Workout */}
        <div className="mb-8 animate-slide-up" style={{ animationDelay: "0.4s" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Featured Workout</h2>
            <a href="#" className="text-fitness-purple flex items-center text-sm hover:underline">
              See All <ArrowRight className="ml-1 h-4 w-4" />
            </a>
          </div>

          <div className="aspect-[16/7] md:aspect-[21/9] rounded-2xl overflow-hidden">
            <WorkoutCard
              {...workouts[0]}
              isPremium={workouts[0].isPremium}
              isUserPremium={clientProfile?.isPremium || false}
              onPremiumAccessAttempt={handlePremiumAccessAttempt}
            />
          </div>
        </div>

        {/* Workout Grid */}
        <div className="mb-8 animate-slide-up" style={{ animationDelay: "0.5s" }}>
          <h2 className="text-xl font-bold text-gray-800 mb-4">All Workouts</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredWorkouts.map((workout, index) => (
              <div
                key={workout.id || index}
                style={{ animationDelay: `${0.2 + index * 0.1}s` }}
                className="animate-scale-in"
              >
                <WorkoutCard
                  {...workout}
                  isPremium={workout.isPremium}
                  isUserPremium={clientProfile?.isPremium || false}
                  onPremiumAccessAttempt={handlePremiumAccessAttempt}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Premium Modal */}
        <PremiumModal isOpen={isPremiumModalOpen} onClose={() => setIsPremiumModalOpen(false)} />
      </div>
    </AnimatedBackground>
  );
};

export default UserWorkout;