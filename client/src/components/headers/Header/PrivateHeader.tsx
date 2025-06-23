import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useEffect, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Search,
  Settings2,
  Menu,
  MapPin,
  User,
  LogOut,
  HelpCircle,
  Dumbbell,
  Badge,
  Crown,
  UserCheck,
} from "lucide-react";
import { useNotifications } from "@/context/NotificationContext"; 

interface HeaderProps {
  userName?: string;
  userLocation?: string;
  userAvatar?: string;
  userType: "admin" | "trainer" | "user";
  onSidebarToggle?: () => void;
  onLogout: () => void;
  className?: string;
}

export function PrivateHeader({
  userName = "Alex Johnson",
  userLocation = "New York, US",
  userAvatar = "",
  userType,
  onSidebarToggle,
  onLogout,
  className,
}: HeaderProps) {
  const { unreadCount } = useNotifications();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Only add keyboard listener for user type
    if (userType !== "user") return;

    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [userType]);

  // Search items only for users
  const getSearchItems = () => {
    return [
      {
        category: "Workouts",
        items: [
          { id: 1, name: "Full Body HIIT", type: "workout", difficulty: "Intermediate" },
          { id: 2, name: "Upper Body Strength", type: "workout", difficulty: "Advanced" },
          { id: 3, name: "Core Foundations", type: "workout", difficulty: "Beginner" },
        ],
      },
      {
        category: "Nutrition",
        items: [
          { id: 4, name: "Protein Meal Plan", type: "nutrition", calories: "1800 cal" },
          { id: 5, name: "Keto Diet Guide", type: "nutrition", calories: "2000 cal" },
          { id: 6, name: "Vegetarian Recipes", type: "nutrition", calories: "1600 cal" },
        ],
      },
    ];
  };

  const searchItems = getSearchItems();

  // Dynamic profile navigation
  const handleProfile = () => {
    switch (userType) {
      case "admin":
        navigate("/admin/profile");
        break;
      case "trainer":
        navigate("/trainer/profile");
        break;
      case "user":
        navigate("/profile");
        break;
      default:
        navigate("/profile");
    }
  };

  // Dynamic notifications navigation
  const handleNotifications = () => {
    switch (userType) {
      case "admin":
        navigate("/admin/notifications");
        break;
      case "trainer":
        navigate("/trainer/notifications");
        break;
      case "user":
        navigate("/notifications");
        break;
      default:
        navigate("/notifications");
    }
  };

  // Premium navigation
  const handlePremium = () => {
    navigate("/premium");
  };

  // Trainer navigation
  const handleTrainer = () => {
    navigate("/alltrainers");
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 h-14 sm:h-16 border-b border-border bg-background shadow-md z-50",
        className
      )}
    >
      <div className="container flex h-full items-center px-2 sm:px-4 lg:px-6 xl:px-8">
        {/* Hamburger menu button */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onSidebarToggle}
                className="h-8 w-8 sm:h-10 sm:w-10 shrink-0"
              >
                <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Toggle sidebar</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Logo */}
        <div className="ml-1 sm:ml-2 mr-2 sm:mr-4 lg:mr-8 flex items-center space-x-1 sm:space-x-2 shrink-0">
          <Dumbbell className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-primary" />
          <span className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold gradient-text">
            StriveX
          </span>
        </div>

        {/* Search - Only show for user type */}
        {userType === "user" && (
          <div className="flex-1 max-w-xs sm:max-w-md lg:max-w-2xl mx-auto">
            {/* Mobile Search - Icon only */}
            <div className="block sm:hidden">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setOpen(true)}
                      className="h-8 w-8 shrink-0"
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Search</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Desktop Search - Full search bar */}
            <div className="hidden sm:block">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      onClick={() => setOpen(true)}
                      className="w-full justify-between text-muted-foreground h-10 text-sm"
                    >
                      <div className="flex items-center min-w-0">
                        <Search className="mr-2 h-4 w-4 shrink-0" />
                        <span className="truncate">
                          Search workouts or nutrition plans...
                        </span>
                      </div>
                      <kbd className="hidden lg:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium text-muted-foreground shrink-0">
                        <span className="text-xs">⌘</span>K
                      </kbd>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Press ⌘K to search</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <CommandDialog open={open} onOpenChange={setOpen}>
              <Command className="rounded-lg border shadow-md">
                <CommandInput placeholder="Type to search..." />
                <CommandList>
                  <CommandEmpty>No results found.</CommandEmpty>
                  {searchItems.map((group) => (
                    <CommandGroup key={group.category} heading={group.category}>
                      {group.items.map((item) => (
                        <CommandItem
                          key={item.id}
                          onSelect={() => {
                            setOpen(false);
                          }}
                        >
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  ))}
                </CommandList>
              </Command>
            </CommandDialog>
          </div>
        )}

        {/* Navigation Buttons - Premium and Trainer (only for user type) */}
        {userType === "user" && (
          <div className="ml-2 sm:ml-4 flex items-center space-x-1 sm:space-x-2">
            {/* Premium Button */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePremium}
                    className="h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm font-medium text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:text-amber-300 dark:hover:bg-amber-950/20"
                  >
                    <Crown className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Premium</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Upgrade to Premium</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Trainer Button */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleTrainer}
                    className="h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-950/20"
                  >
                    <UserCheck className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Trainers</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Find a Trainer</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}

        {/* Spacer for admin/trainer when no search */}
        {(userType === "admin" || userType === "trainer") && (
          <div className="flex-1" />
        )}

        {/* Right Section */}
        <div className="ml-2 sm:ml-4 lg:ml-8 flex items-center space-x-1 sm:space-x-2 lg:space-x-4">
          {/* User Info - Hidden on mobile and tablets, shown on large screens */}
          <div className="hidden xl:flex items-center space-x-3 2xl:space-x-4">
            <div className="flex flex-col items-end">
              <span className="text-sm font-medium truncate max-w-32 2xl:max-w-none">
                Hi, {userName}
              </span>
              <div className="flex items-center text-xs text-muted-foreground">
                <MapPin className="mr-1 h-3 w-3 shrink-0" />
                <span className="truncate max-w-24 2xl:max-w-none">{userLocation}</span>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative h-8 w-8 sm:h-10 sm:w-10 shrink-0"
                  onClick={handleNotifications}
                >
                  <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 sm:top-0 sm:right-0 inline-flex items-center justify-center px-1 sm:px-2 py-0.5 sm:py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full transform sm:translate-x-1/2 sm:-translate-y-1/2 min-w-4 sm:min-w-5 h-4 sm:h-5">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Notifications</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Avatar with Dropdown */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <div className="cursor-pointer">
                        <Avatar className="h-7 w-7 sm:h-8 sm:w-8 lg:h-9 lg:w-9 shrink-0">
                          <AvatarImage src={userAvatar} alt={userName} />
                          <AvatarFallback className="bg-primary text-white text-xs sm:text-sm">
                            {userName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent 
                      className="w-48 sm:w-56" 
                      align="end"
                      sideOffset={8}
                    >
                      <DropdownMenuLabel className="px-2 py-1.5">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none truncate">
                            {userName}
                          </p>
                          <div className="flex items-center text-xs text-muted-foreground xl:hidden">
                            <MapPin className="mr-1 h-3 w-3 shrink-0" />
                            <span className="truncate">{userLocation}</span>
                          </div>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuGroup>
                        <DropdownMenuItem className="cursor-pointer" onClick={handleProfile}>
                          <User className="mr-2 h-4 w-4" />
                          <span>Profile</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer" onClick={handleNotifications}>
                          <Bell className="mr-2 h-4 w-4" />
                          <span>Notifications</span>
                          {unreadCount > 0 && (
                            <Badge className="ml-auto h-5 text-xs">
                              {unreadCount > 99 ? '99+' : unreadCount}
                            </Badge>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer">
                          <Settings2 className="mr-2 h-4 w-4" />
                          <span>Settings</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer">
                          <HelpCircle className="mr-2 h-4 w-4" />
                          <span>Help & Support</span>
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="cursor-pointer text-red-500 hover:bg-red-500/10 focus:bg-red-500/10"
                        onClick={onLogout}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TooltipTrigger>
              <TooltipContent>Account</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </header>
  );
}