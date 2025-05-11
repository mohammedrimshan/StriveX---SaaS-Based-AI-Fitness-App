import { 
  HomeIcon, 
  Dumbbell, 
  Bot, 
  Activity, 
  Calendar, 
  CreditCard,
  HelpCircle,
  Settings,
  Users,
  UserCheck ,
  LayoutDashboard,
  Crown ,
 Tags,
 MessageSquare
} from "lucide-react";

const navItems = {
  client: [
    {
      title: "Dashboard",
      icon: HomeIcon,
      path: "/dashboard",
    },
    {
      title: "Workouts",
      icon: Dumbbell,
      path: "/workouts",
    },
    {
      title: "Generate Diet & Work Out",
      icon: Bot,
      path: "/aiplanning",
    },
    {
      title: "Trainers",
      icon: Users,
      path: "/alltrainers",
    },
    {
      title: "Progress Tracker",
      icon: Activity,
      path: "/progress",
    },
    {
      title: "Calendar",
      icon: Calendar,
      path: "/booking",
    },
    {
      title: "Chat",
      icon: MessageSquare,
      path: "/chat",
    },
    {
      title: "Subscription",
      icon: CreditCard,
      path: "/premium",
    },
    {
      title: "Support",
      icon: HelpCircle,
      path: "/support",
    },
    {
      title: "Settings",
      icon: Settings,
      path: "/settings",
    },
  ],
  trainer: [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      path: "/trainer/dashboard",
    },
    {
      title: "Clients",
      icon: Users,
      path: "/trainer/clientrequest",
    },
    {
      title: "Schedule",
      icon: Calendar,
      path: "/trainer/slotadd",
    },
    {
      title: "Chat",
      icon: MessageSquare,
      path: "/trainer/chat",
    },
    {
      title: "Workout Plans",
      icon: Dumbbell,
      path: "/trainer/workout-plans",
    },
    {
      title: "Earnings",
      icon: CreditCard,
      path: "/trainer/earnings",
    },
    {
      title: "Settings",
      icon: Settings,
      path: "/trainer/settings",
    },
  ],
  admin: [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      path: "/admin/dashboard",
    },
    {
      title: "Manage Clients",
      icon: Users,
      path: "/admin/clients",
    },
    {
      title: "Manage Trainers",
      icon: Users,
      path: "/admin/trainers",
    }, 
    {
      title: "Trainer Verification",
      icon: UserCheck,
      path: "/admin/trainerverification",
    }, 
    {
      title: "Category Management",
      icon: Tags,
      path: "/admin/category",
    }, 
    {
      title: "Subscriptions",
      icon: CreditCard,
      path: "/admin/subscriptions",
    },
    {
      title: "Membsrship Management",
      icon: Crown ,
      path: "/admin/membership",
    },
    {
      title: "Add Workout",
      icon: Dumbbell,
      path: "/admin/workout",
    },
    {
      title: "Workout Management",
      icon: Dumbbell,
      path: "/admin/workouts",
    },
    {
      title: "Analytics", 
      icon: Activity,
      path: "/admin/analytics",
    },
    {
      title: "Settings",
      icon: Settings,
      path: "/admin/settings",
    },
  ],
};

export default navItems;