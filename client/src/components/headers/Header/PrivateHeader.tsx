import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
} from "lucide-react";

interface HeaderProps {
  userName?: string;
  userLocation?: string;
  userAvatar?: string;
  userType: "admin" | "trainer" | "user"; // Make userType required
  notifications?: number;
  onSidebarToggle?: () => void;
  onLogout: () => void;
  className?: string;
}

export function PrivateHeader({
  userName = "Alex Johnson",
  userLocation = "New York, US",
  userAvatar = "",
  userType, // No default value, enforce passing it
  notifications = 3,
  onSidebarToggle,
  onLogout,
  className,
}: HeaderProps) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Dynamic search items based on user type
  const getSearchItems = () => {
    switch (userType) {
      case "admin":
        return [
          {
            category: "Admin Management",
            items: [
              { id: 1, name: "User Management", type: "admin", tag: "System" },
              { id: 2, name: "Facility Settings", type: "admin", tag: "Configuration" },
              { id: 3, name: "Billing & Subscriptions", type: "admin", tag: "Finance" },
            ],
          },
        ];
      case "trainer":
        return [
          {
            category: "Training Resources",
            items: [
              { id: 1, name: "Client Schedules", type: "trainer", tag: "Planning" },
              { id: 2, name: "Workout Templates", type: "trainer", tag: "Resources" },
              { id: 3, name: "Performance Tracking", type: "trainer", tag: "Analytics" },
            ],
          },
        ];
      case "user":
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
      default:
        console.warn(`Unknown userType: ${userType}`);
        return [];
    }
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
        navigate("/profile"); // Fallback
    }
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 h-16 border-b border-border bg-background shadow-md z-50",
        className
      )}
    >
      <div className="container flex h-full items-center px-4">
        {/* Hamburger menu button */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={onSidebarToggle}>
                <Menu className="h-6 w-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Toggle sidebar</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Logo */}
        <div className="ml-2 mr-8 flex items-center space-x-2">
          <Dumbbell className="h-7 w-7 text-primary" />
          <span className="text-2xl font-bold gradient-text">StriveX</span>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-2xl mx-auto">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  onClick={() => setOpen(true)}
                  className="w-full justify-between text-muted-foreground"
                >
                  <div className="flex items-center">
                    <Search className="mr-2 h-4 w-4" />
                    <span>
                      {userType === "admin"
                        ? "Search users, settings..."
                        : userType === "trainer"
                        ? "Search clients, workouts..."
                        : "Search workouts or nutrition plans..."}
                    </span>
                  </div>
                  <kbd className="hidden md:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium text-muted-foreground">
                    <span className="text-xs">⌘</span>K
                  </kbd>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Press ⌘K to search</TooltipContent>
            </Tooltip>
          </TooltipProvider>
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
                        <div className="flex items-center justify-between w-full">
                          <span>{item.name}</span>
                          {item.type === "workout" ? (
                            <Badge variant="secondary" className="bg-primary/20 text-primary">
                              {item.difficulty}
                            </Badge>
                          ) : item.type === "nutrition" ? (
                            <Badge variant="outline">{item.calories}</Badge>
                          ) : (
                            <Badge variant="outline">{item.tag}</Badge>
                          )}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ))}
              </CommandList>
            </Command>
          </CommandDialog>
        </div>

        {/* Right Section */}
        <div className="ml-8 flex items-center space-x-6">
          {/* User Info */}
          <div className="hiddenmehidden md:flex items-center space-x-4">
            <div className="flex flex-col items-end">
              <span className="text-sm font-medium">Hi, {userName}</span>
              <div className="flex items-center text-xs text-muted-foreground">
                <MapPin className="mr-1 h-3 w-3" />
                {userLocation}
              </div>
            </div>
          </div>

          {/* Notifications */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon" className="relative">
                        <Bell className="h-5 w-5" />
                        {notifications > 0 && (
                          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-white flex items-center justify-center">
                            {notifications}
                          </span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80" align="end">
                      <div className="space-y-2">
                        <h4 className="font-medium leading-none">Notifications</h4>
                        <p className="text-sm text-muted-foreground">
                          You have {notifications} unread notifications.
                        </p>
                        <div className="border-t border-border pt-2 mt-2">
                          <div className="flex items-start space-x-2 mb-2">
                            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white">
                              <Dumbbell className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">Workout Reminder</p>
                              <p className="text-xs text-muted-foreground">
                                Your scheduled workout starts in 30 minutes
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-2">
                            <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center text-white">
                              <MapPin className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">Weekly Goal Progress</p>
                              <p className="text-xs text-muted-foreground">
                                You've completed 75% of your weekly fitness goal
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
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
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={userAvatar} alt={userName} />
                          <AvatarFallback className="bg-primary text-white">
                            {userName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end">
                      <DropdownMenuLabel>My Account</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuGroup>
                        <DropdownMenuItem className="cursor-pointer" onClick={handleProfile}>
                          <User className="mr-2 h-4 w-4" />
                          <span>Profile</span>
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