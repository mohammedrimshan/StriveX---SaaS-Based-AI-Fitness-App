import { useState } from "react";
import { AppSidebar } from "@/components/sidebars/SideBar";
import { PrivateHeader } from "@/components/common/Header/PrivateHeader";
import { 
  Dumbbell, HomeIcon, Activity, Calendar, 
  Bot, CreditCard, HelpCircle 
} from "lucide-react";

export default function DashboardLayout({ children }) {
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: HomeIcon },
    { name: "Workouts", href: "/workouts", icon: Dumbbell },
    { name: "AI Diet & Work Out", href: "/ai-planner", icon: Bot },
    { name: "Progress Tracker", href: "/progress", icon: Activity },
    { name: "Calendar", href: "/calendar", icon: Calendar },
    { name: "Subscription", href: "/subscription", icon: CreditCard },
    { name: "Support", href: "/support", icon: HelpCircle },
  ];

  const handleLogout = () => {
    // Your logout logic here
    console.log("Logging out...");
  };

  return (
    <div className="min-h-screen bg-background">
      <PrivateHeader 
        onSidebarToggle={() => setSidebarVisible(true)}
        onLogout={handleLogout}
      />
      <AppSidebar 
        isVisible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
        handleLogout={handleLogout}
        navItems={navItems}
      />
      <main className="pt-16 px-4 container mx-auto">
        {children}
      </main>
    </div>
  );
}