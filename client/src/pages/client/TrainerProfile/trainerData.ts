import { TrainerProfile } from "@/types/trainer";

export const mockTrainer: TrainerProfile = {
  id: "t-123456",
  firstName: "Alex",
  lastName: "Morgan",
  email: "alex.morgan@fitpro.com",
  phoneNumber: "+1 (555) 123-4567",
  profileImage: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1180&q=80",
  bio: "Dedicated fitness professional with extensive experience in strength training, nutrition counseling, and performance optimization. I believe in a holistic approach to fitness that combines proper training, nutrition, and recovery strategies.",
  location: "New York, NY",
  experience: 7,
  rating: 4.8,
  clientCount: 120,
  sessionCount: 1450,
  specialization: ["Weight Loss", "Muscle Building", "Sports Performance", "Functional Fitness"],
  certifications: [
    "Certified Personal Trainer (CPT)",
    "Certified Strength and Conditioning Specialist (CSCS)",
    "Precision Nutrition Level 1",
    "CrossFit Level 2 Trainer",
    "TRX Suspension Training Specialist"
  ],
  qualifications: [
    "Bachelor's in Exercise Science",
    "Master's in Sports Nutrition",
    "Certified Fitness Instructor",
    "Sports Medicine Specialist"
  ],
  skills: [
    "Weight Training",
    "HIIT",
    "Nutrition Planning",
    "Cardio",
    "Flexibility",
    "Strength Training",
    "Functional Training",
    "Injury Rehabilitation"
  ],
  availability: ["Mon-Fri: 6am-8pm", "Sat: 8am-2pm", "Sun: Closed"],
    height: 180,
    weight: 75,
    gender: "male",
  approvedByAdmin: true,
  services: [
    {
      id: "s-1",
      title: "Personal Training",
      description: "One-on-one personalized training sessions tailored to your specific goals and fitness level.",
      price: "$75",
      duration: "60 min",
      icon: "dumbbell"
    },
    {
      id: "s-2",
      title: "Nutrition Consultation",
      description: "Comprehensive nutrition planning and guidance to complement your fitness routine.",
      price: "$60",
      duration: "45 min",
      icon: "flame"
    },
    {
      id: "s-3",
      title: "Group Training",
      description: "High-energy group sessions that combine strength training and cardio for maximum results.",
      price: "$30",
      duration: "45 min",
      icon: "users"
    },
    {
      id: "s-4",
      title: "Online Coaching",
      description: "Remote training programs with regular check-ins and adjustments based on your progress.",
      price: "$200",
      duration: "Monthly",
      icon: "laptop"
    },
    {
      id: "s-5",
      title: "Fitness Assessment",
      description: "Comprehensive evaluation of your current fitness level, mobility, and body composition.",
      price: "$90",
      duration: "75 min",
      icon: "clipboard-check"
    },
    {
      id: "s-6",
      title: "Recovery Session",
      description: "Guided stretching and recovery techniques to improve mobility and reduce soreness.",
      price: "$50",
      duration: "45 min",
      icon: "refresh-cw"
    }
  ]
};
