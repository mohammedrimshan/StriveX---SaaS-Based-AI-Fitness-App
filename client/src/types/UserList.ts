// Format Fitness Goal
export const formatFitnessGoal = (goal: string): string => {
  const goalMap: Record<string, string> = {
    weightLoss: "Weight Loss",
    muscleGain: "Muscle Gain",
    endurance: "Endurance",
    flexibility: "Flexibility",
    maintenance: "Maintenance",
  };
  return goalMap[goal] || (goal ? goal.charAt(0).toUpperCase() + goal.slice(1) : 'N/A');
};

// Format Experience Level
export const formatExperienceLevel = (level: string): string => {
  const levelMap: Record<string, string> = {
    beginner: "Beginner",
    intermediate: "Intermediate",
    advanced: "Advanced",
    expert: "Expert",
  };
  return levelMap[level] || (level ? level.charAt(0).toUpperCase() + level.slice(1) : 'N/A');
};

// Format Activity Level
export const formatActivityLevel = (level: string): string => {
  const levelMap: Record<string, string> = {
    sedentary: "Sedentary",
    light: "Light",
    moderate: "Moderate",
    active: "Active",
    veryActive: "Very Active",
  };
  return levelMap[level] || (level ? level.charAt(0).toUpperCase() + level.slice(1) : 'N/A');
};

// Format Health Condition
export const formatHealthCondition = (condition: string): string => {
  const conditionMap: Record<string, string> = {
    diabetes: "Diabetes",
    "heart-disease": "Heart Disease",
    asthma: "Asthma",
    allergies: "Allergies",
    hypertension: "Hypertension",
    other: "Other",
  };
  return conditionMap[condition] || (condition ? condition.charAt(0).toUpperCase() + condition.slice(1) : 'N/A');
};

// Format Diet Preference
export const formatDietPreference = (diet: string): string => {
  const dietMap: Record<string, string> = {
    balanced: "Normal / Balanced Diet",
    vegetarian: "Vegetarian",
    vegan: "Vegan",
    pescatarian: "Pescatarian",
    highProtein: "High Protein",
    lowCarb: "Low Carb",
    lowFat: "Low Fat",
    glutenFree: "Gluten-Free",
    dairyFree: "Dairy-Free",
    sugarFree: "Sugar-Free",
    keto: "Keto",
    noPreference: "No Preference",
  };
  return dietMap[diet] || (diet ? diet.charAt(0).toUpperCase() + diet.slice(1) : 'N/A');
};

// Format Skill
export const formatSkill = (skill: string): string => {
  const skillMap: Record<string, string> = {
    strengthTraining: "Strength Training",
    mindfulnessFocus: "Mindfulness & Focus",
    stressManagement: "Stress Management",
    coreStrengthening: "Core Strengthening",
    postureAlignment: "Posture Alignment",
    physiotherapy: "Physiotherapy",
    muscleBuilding: "Muscle Building",
    flexibility: "Flexibility",
    nutrition: "Nutrition",
    weightLoss: "Weight Loss",
  };
  return skillMap[skill] || (skill ? skill.charAt(0).toUpperCase() + skill.slice(1).replace(/([A-Z])/g, ' $1') : 'N/A');
};

// Format Selection Mode
export const formatSelectionMode = (mode: string): string => {
  const modeMap: Record<string, string> = {
    auto: "Auto-Match",
    manual: "Manual Selection",
  };
  return modeMap[mode] || (mode ? mode.charAt(0).toUpperCase() + mode.slice(1) : 'N/A');
};

// Format Preferred Workout
export const formatPreferredWorkout = (workout: string): string => {
  const workoutMap: Record<string, string> = {
    Cardio: "Cardio",
    Meditation: "Meditation",
    Pilates: "Pilates",
    Yoga: "Yoga",
    Calisthenics: "Calisthenics",
  };
  return workoutMap[workout] || (workout ? workout.charAt(0).toUpperCase() + workout.slice(1) : 'N/A');
};

// Get Badge Color for Fitness Goal
export const getBadgeColorForFitnessGoal = (goal: string): string => {
  const colorMap: Record<string, string> = {
    weightLoss: "bg-rose-500 text-white",
    muscleGain: "bg-blue-500 text-white",
    endurance: "bg-green-500 text-white",
    flexibility: "bg-amber-500 text-white",
    maintenance: "bg-teal-500 text-white",
  };
  return colorMap[goal] || "bg-gray-500 text-white";
};

// Get Water Intake Level
export const getWaterIntakeLevel = (intake: number): string => {
  if (intake < 0 || intake > 8000) return "Invalid";
  if (intake < 2000) return "Low";
  if (intake < 4000) return "Moderate";
  if (intake < 6000) return "Good";
  return "Excellent";
};

// Get Water Intake Color
export const getWaterIntakeColor = (intake: number): string => {
  if (intake < 0 || intake > 8000) return "text-red-500";
  if (intake < 2000) return "text-orange-500";
  if (intake < 4000) return "text-blue-500";
  if (intake < 6000) return "text-green-500";
  return "text-teal-500";
};

// Get Goal Icon
export const getGoalIcon = (goal: string): string => {
  const iconMap: Record<string, string> = {
    weightLoss: "scale-down",
    muscleGain: "dumbbell",
    endurance: "timer",
    flexibility: "stretch",
    maintenance: "activity",
  };
  return iconMap[goal] || "target";
};

// Get Experience Level Color
export const getExperienceLevelColor = (level: string): string => {
  const colorMap: Record<string, string> = {
    beginner: "bg-emerald-100 text-emerald-800 border-emerald-200",
    intermediate: "bg-blue-100 text-blue-800 border-blue-200",
    advanced: "bg-purple-100 text-purple-800 border-purple-200",
    expert: "bg-rose-100 text-rose-800 border-rose-200",
  };
  return colorMap[level] || "bg-gray-100 text-gray-800 border-gray-200";
};
