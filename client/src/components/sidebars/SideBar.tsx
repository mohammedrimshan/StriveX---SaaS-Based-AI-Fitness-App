import { useEffect, useState } from "react";
import { LogOut, ArrowLeftCircle } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface NavItemProps {
  item: {
    name: string;
    href: string;
    icon: React.ElementType;
  };
  isActive: boolean;
  onClick: () => void;
}

const NavItem = ({ item, isActive, onClick }: NavItemProps) => {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
        isActive
          ? "bg-primary text-white font-medium"
          : "text-foreground/70 hover:bg-accent/10 hover:text-primary"
      )}
      onClick={onClick}>
      <Icon className="h-5 w-5" />
      <span>{item.name}</span>
    </Link>
  );
};

interface SidebarProps {
  isVisible: boolean;
  onClose: () => void;
  handleLogout?: () => void;
  className?: string;
  navItems?: Array<{
    name: string;
    href: string;
    icon: React.ElementType;
  }>;
}

export function AppSidebar({
  isVisible,
  onClose,
  handleLogout,
  className,
  navItems = [],
}: SidebarProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] =
    useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedIndex = localStorage.getItem("activeItem");
      if (storedIndex) {
        setActiveIndex(Number.parseInt(storedIndex, 10));
      }
    }
  }, []);

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
    setIsConfirmationModalOpen(false);
    if (typeof window !== "undefined") {
      localStorage.removeItem("activeItem");
    }
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
      <div
        className={cn(
          "fixed left-0 z-50 h-full w-64 transform transition-transform duration-300 ease-in-out",
          isVisible ? "translate-x-0" : "-translate-x-full",
          className
        )}>
        <div className="flex flex-col h-full bg-background border-r border-border shadow-lg">
          {/* Sidebar Header */}
          <div className="flex justify-between items-center px-6 py-3.5 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 text-primary">
                <Dumbbell className="h-8 w-8" />
              </div>
              <span className="text-2xl font-bold gradient-text">
                StriveX
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-foreground hover:text-primary hover:bg-transparent">
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
                  onClick={() => {
                    setActiveIndex(index);
                    onClose();
                  }}
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
      </div>

      {/* Confirmation Modal for Logout */}
      <Dialog
        open={isConfirmationModalOpen}
        onOpenChange={setIsConfirmationModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-background text-foreground border-border">
          <DialogHeader>
            <DialogTitle>Logout</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Are you sure you want to logout from StriveX?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setIsConfirmationModalOpen(false)}
              className="border-border text-foreground hover:bg-accent/10 hover:text-foreground">
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={onConfirmLogout}
              className="bg-red-600 hover:bg-red-700">
              Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

import { Dumbbell } from "lucide-react";