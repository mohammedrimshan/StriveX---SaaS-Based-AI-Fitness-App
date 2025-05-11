import { useEffect, useState } from "react";
import { LogOut, ArrowLeftCircle } from "lucide-react";
import { useNavigate } from "react-router-dom"; 
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Dumbbell } from "lucide-react";
import SideBarItems from "./Prop/UserProp";
import ConfirmationModal from "@/components/modals/ConfirmationModal";

interface NavItemProps {
  item: {
    title: string;
    path: string;
    icon: React.ElementType;
  };
  isActive: boolean;
  onClick: () => void;
}

const NavItem = ({ item, isActive, onClick }: NavItemProps) => {
  const Icon = item.icon;
  const navigate = useNavigate();

  const handleItemClick = (e:any) => {
    e.preventDefault(); 
    navigate(item.path); 
    onClick(); 
  };

  return (
    <div
      className={cn(
        "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors cursor-pointer",
        isActive
          ? "bg-violet-600 text-white font-medium"
          : "text-foreground/70 hover:bg-violet-100/10 hover:text-violet-400"
      )}
      onClick={handleItemClick}>
      <Icon className="h-5 w-5" />
      <span>{item.title}</span>
    </div>
  );
};

interface SidebarProps {
  isVisible: boolean;
  onClose: () => void;
  handleLogout?: () => void;
  className?: string;
  role: "admin" | "client" | "trainer";
}

export function AppSidebar({
  isVisible,
  onClose,
  handleLogout,
  className,
  role = "client",
}: SidebarProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  
  const navItems = SideBarItems[role];
  const navigate = useNavigate(); 

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedIndex = localStorage.getItem("activeItem");
      if (storedIndex) {
        setActiveIndex(Number.parseInt(storedIndex, 10));
      }

      // Find the active index based on current path
      const currentPath = window.location.pathname;
      const index = navItems.findIndex(item => 
        currentPath.includes(item.path) || currentPath === item.path
      );
      
      if (index !== -1) {
        setActiveIndex(index);
      }
    }
  }, [navItems]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("activeItem", activeIndex.toString());
    }
  }, [activeIndex]);

  // Lock body scroll when sidebar is open
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isVisible]);

  const handleLogoutClick = () => {
    setIsConfirmationModalOpen(true);
  };

  const onConfirmLogout = () => {
    if (handleLogout) {
      handleLogout();
    }
    if (typeof window !== "undefined") {
      localStorage.removeItem("activeItem");
    }
  };

  const handleNavItemClick = (index:any, path:any) => {
    setActiveIndex(index);
    navigate(path); // Use React Router navigation
    onClose();
  };

  return (
    <>
      {/* Overlay with AnimatePresence for smooth transitions */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: isVisible ? 0 : "-100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className={cn(
          "fixed left-0 z-50 h-full w-64 shadow-lg",
          className
        )}>
        <div className="flex flex-col h-full bg-background border-r border-border">
          {/* Sidebar Header */}
          <div className="flex justify-between items-center px-6 py-3.5 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 text-violet-500">
                <Dumbbell className="h-8 w-8" />
              </div>
              <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-purple-600">
                StriveX
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-foreground hover:text-violet-500 hover:bg-transparent">
              <ArrowLeftCircle className="h-6 w-6" />
            </Button>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 mt-1 px-3 overflow-y-auto">
            <div className="space-y-1 py-2">
              {navItems.map((item, index) => (
                <NavItem
                  key={index}
                  item={item}
                  isActive={index === activeIndex}
                  onClick={() => handleNavItemClick(index, item.path)}
                />
              ))}
            </div>
          </nav>

          {/* Logout Button */}
          <div className="mt-auto p-4 border-t border-border">
            <Button
              variant="ghost"
              className="w-full justify-start text-foreground/70 hover:bg-red-600 hover:text-white"
              onClick={handleLogoutClick}>
              <LogOut className="h-5 w-5 mr-2" />
              Sign-out
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Confirmation Modal for Logout */}
      <ConfirmationModal
        isOpen={isConfirmationModalOpen}
        onClose={() => setIsConfirmationModalOpen(false)}
        onConfirm={onConfirmLogout}
        title="Logout from StriveX"
        description="Are you sure you want to sign out from your account? You'll need to log back in to access your workouts and progress."
        confirmText="Sign Out"
        cancelText="Cancel"
        isDarkMode={true}
        icon="logout"
      />
    </>
  );
}