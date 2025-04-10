export interface Exercise {
    _id?: string;
    name: string;
    description: string;
    duration: number;
    videoUrl?: string;
    defaultRestDuration: number;
  }
  
  export interface Workout {
    _id: string;
    title: string;
    description: string;
    category: string;
    duration: number;
    difficulty: "Beginner" | "Intermediate" | "Advanced";
    imageUrl?: string;
    exercises: Exercise[];
    isPremium: boolean;
    status: boolean;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface PaginatedResponse<T> {
    items: T[];
    totalItems: number;
    currentPage: number;
    totalPages: number;
  }
  
// Mock Exercises
const mockExercises: Exercise[] = [
  {
    _id: "ex1",
    name: "Push-up",
    description: "A classic exercise that works the chest, shoulders, and triceps.",
    duration: 60,
    videoUrl: "https://www.youtube.com/watch?v=IODxDxX7oi4",
    defaultRestDuration: 30,
  },
  {
    _id: "ex2",
    name: "Squat",
    description: "A compound exercise that targets the quadriceps, hamstrings, and glutes.",
    duration: 60,
    videoUrl: "https://www.youtube.com/watch?v=YaXPRqUwItQ",
    defaultRestDuration: 30,
  },
  {
    _id: "ex3",
    name: "Plank",
    description: "An isometric core exercise that improves stability and posture.",
    duration: 30,
    videoUrl: "https://www.youtube.com/watch?v=pSHjTRCQxIw",
    defaultRestDuration: 20,
  },
  {
    _id: "ex4",
    name: "Lunges",
    description: "A unilateral exercise that works the quadriceps, hamstrings, and glutes.",
    duration: 60,
    videoUrl: "https://www.youtube.com/watch?v=QOVaHwm-Q6U",
    defaultRestDuration: 30,
  },
  {
    _id: "ex5",
    name: "Burpees",
    description: "A full-body exercise that combines a push-up and a jump.",
    duration: 45,
    videoUrl: "https://www.youtube.com/watch?v=TU8QYVW0gDU",
    defaultRestDuration: 30,
  },
  {
    _id: "ex6",
    name: "Mountain Climbers",
    description: "A dynamic exercise that works the core, shoulders, and legs.",
    duration: 45,
    videoUrl: "https://www.youtube.com/watch?v=nmwgirgXLYM",
    defaultRestDuration: 20,
  },
  {
    _id: "ex7",
    name: "Jumping Jacks",
    description: "A cardio exercise that works the whole body.",
    duration: 60,
    videoUrl: "https://www.youtube.com/watch?v=c4DAnQ6DtF8",
    defaultRestDuration: 15,
  },
  {
    _id: "ex8",
    name: "Bicycle Crunches",
    description: "An abdominal exercise that targets the obliques.",
    duration: 45,
    videoUrl: "https://www.youtube.com/watch?v=9FGilxCbdz8",
    defaultRestDuration: 20,
  },
];

// Mock Workouts
const mockWorkouts: Workout[] = [
  {
    _id: "w1",
    title: "Full Body Strength",
    description: "A comprehensive workout targeting all major muscle groups for strength building.",
    category: "cat1",
    duration: 45,
    difficulty: "Intermediate",
    imageUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
    exercises: [mockExercises[0], mockExercises[1], mockExercises[4], mockExercises[5]],
    isPremium: false,
    status: true,
    createdAt: "2023-01-15T12:00:00Z",
    updatedAt: "2023-03-20T15:30:00Z",
  },
  {
    _id: "w2",
    title: "HIIT Cardio Blast",
    description: "High-intensity interval training to improve cardiovascular fitness and burn calories.",
    category: "cat2",
    duration: 30,
    difficulty: "Advanced",
    imageUrl: "https://images.unsplash.com/photo-1434682881908-b43d0467b798?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1474&q=80",
    exercises: [mockExercises[4], mockExercises[6], mockExercises[3], mockExercises[7]],
    isPremium: true,
    status: true,
    createdAt: "2023-02-10T09:15:00Z",
    updatedAt: "2023-04-05T11:45:00Z",
  },
  {
    _id: "w3",
    title: "Core Crusher",
    description: "Focused abdominal workout to strengthen your core and improve stability.",
    category: "cat3",
    duration: 20,
    difficulty: "Beginner",
    imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
    exercises: [mockExercises[2], mockExercises[7], mockExercises[5]],
    isPremium: false,
    status: true,
    createdAt: "2023-03-05T16:30:00Z",
    updatedAt: "2023-05-12T14:20:00Z",
  },
  {
    _id: "w4",
    title: "Leg Day",
    description: "Intensive lower body workout focusing on building leg strength and muscle.",
    category: "cat1",
    duration: 40,
    difficulty: "Intermediate",
    imageUrl: "https://images.unsplash.com/photo-1534258936925-c58bed479fcb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1331&q=80",
    exercises: [mockExercises[1], mockExercises[3]],
    isPremium: false,
    status: true,
    createdAt: "2023-01-25T10:45:00Z",
    updatedAt: "2023-04-18T09:30:00Z",
  },
  {
    _id: "w5",
    title: "Upper Body Power",
    description: "Build upper body strength with this focused workout routine.",
    category: "cat1",
    duration: 35,
    difficulty: "Advanced",
    imageUrl: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
    exercises: [mockExercises[0], mockExercises[4], mockExercises[6]],
    isPremium: true,
    status: true,
    createdAt: "2023-02-18T13:20:00Z",
    updatedAt: "2023-05-01T17:10:00Z",
  },
  {
    _id: "w6",
    title: "Beginner Total Body",
    description: "Perfect for beginners looking to start their fitness journey with a full body workout.",
    category: "cat4",
    duration: 30,
    difficulty: "Beginner",
    imageUrl: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1469&q=80",
    exercises: [mockExercises[0], mockExercises[1], mockExercises[2], mockExercises[6]],
    isPremium: false,
    status: true,
    createdAt: "2023-03-12T11:00:00Z",
    updatedAt: "2023-04-28T16:45:00Z",
  },
];

// Paginated response generator for workouts
export const getPaginatedWorkouts = (
  page: number = 1,
  limit: number = 5
): PaginatedResponse<Workout> => {
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const paginatedItems = mockWorkouts.slice(startIndex, endIndex);
  
  return {
    items: paginatedItems,
    totalItems: mockWorkouts.length,
    currentPage: page,
    totalPages: Math.ceil(mockWorkouts.length / limit),
  };
};

// Get single workout by ID
export const getWorkoutById = (id: string): Workout | undefined => {
  return mockWorkouts.find(workout => workout._id === id);
};

// Get exercises for a workout
export const getExercisesByWorkoutId = (
  workoutId: string,
  page: number = 1,
  limit: number = 5
): PaginatedResponse<Exercise> => {
  const workout = mockWorkouts.find(w => w._id === workoutId);
  
  if (!workout) {
    return {
      items: [],
      totalItems: 0,
      currentPage: page,
      totalPages: 0,
    };
  }
  
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const paginatedItems = workout.exercises.slice(startIndex, endIndex);
  
  return {
    items: paginatedItems,
    totalItems: workout.exercises.length,
    currentPage: page,
    totalPages: Math.ceil(workout.exercises.length / limit),
  };
};

// Get exercise by ID
export const getExerciseById = (exerciseId: string): Exercise | undefined => {
  for (const workout of mockWorkouts) {
    const exercise = workout.exercises.find(ex => ex._id === exerciseId);
    if (exercise) return exercise;
  }
  return undefined;
};