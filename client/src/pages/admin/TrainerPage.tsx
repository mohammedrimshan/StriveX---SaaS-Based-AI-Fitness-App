"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  UserCheck,
  UserX,
  Dumbbell,
  Brain,
  Heart,
  MonitorIcon as Running,
  SpaceIcon as Yoga,
  RefreshCw,
  Download,
  CheckCircle2,
  XCircle,
  UsersIcon,
  Mail,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Pagination1 } from "@/components/common/Pagination/Pagination1";
import { UserFilters } from "./AdminComponents/UserFilter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { debounce } from "lodash";
import { useToaster } from "@/hooks/ui/useToaster";
import { useAllUsersQuery } from "@/hooks/admin/useAllUsers";
import { useUpdateUserStatusMutation } from "@/hooks/admin/useUpdateUserStatus";
import { getAllUsers } from "@/services/admin/adminService";
import { IClient } from "@/types/User";

// Define specialization types and their icons
const specializationIcons = {
  Yoga: Yoga,
  Meditation: Brain,
  Workout: Dumbbell,
  Cardio: Heart,
  Running: Running,
};

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilters, setActiveFilters] = useState({
    status: [] as string[],
    specialization: [] as string[],
  });

  const limit = 10;
  const userType = "client";
  const { mutate: updateUserStatus } = useUpdateUserStatusMutation();
  const { errorToast, successToast } = useToaster();

  // Handle debounced search
  useEffect(() => {
    const handler = debounce(() => setDebouncedSearch(searchQuery), 300);
    handler();
    return () => handler.cancel();
  }, [searchQuery]);

  // Fetch users data from backend
  const { data, isLoading, isError, refetch } = useAllUsersQuery<IClient>(
    getAllUsers,
    currentPage,
    limit,
    debouncedSearch,
    userType
  );

  const filteredUsers = data?.users || [];
  const totalFilteredUsers = filteredUsers.length;
  const totalPages = Math.ceil(totalFilteredUsers / limit) || 1;

  // Handle user status toggle
  const handleStatusToggle = (user: IClient) => {
    updateUserStatus(
      { userType, userId: user.id },
      {
        onSuccess: (data) => {
          successToast(data.message);
          refetch(); 
        },
        onError: (error: any) => {
          errorToast(
            error.response?.data?.message || "Failed to update user status"
          );
        },
      }
    );
  };

  // Utility function to get user initials
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Get user specialization
  const getUserSpecialization = (user: IClient) => {
    return user.specialization || user.preferences?.[0] || "Workout";
  };

  return (
    <div className="p-6 pt-24 w-full min-h-screen bg-gray-100">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col gap-6 w-full bg-white p-6 rounded-lg"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center gap-3"
          >
            <div className="p-2 rounded-lg bg-violet-100">
              <UsersIcon className="h-6 w-6 text-violet-600" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Users</h1>
            <Badge
              variant="outline"
              className="ml-2 bg-violet-50 text-violet-700 border-violet-200"
            >
              {totalFilteredUsers || 0} total
            </Badge>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex items-center gap-2"
          >
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    onClick={() => refetch()}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Refresh</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" className="h-9 w-9">
                    <Download className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Export</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </motion.div>
        </div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
        >
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users by name, email or phone..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 border-violet-200 focus-visible:ring-violet-500"
            />
          </div>

          <UserFilters
            activeFilters={activeFilters}
            setActiveFilters={setActiveFilters}
            userType={userType}
          />
        </motion.div>

        {/* Users Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="w-full"
        >
          <Card className="overflow-hidden w-full border-violet-100">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-violet-50">
                    <TableRow className="border-b">
                      <TableHead className="w-12 text-violet-700">#</TableHead>
                      <TableHead className="text-violet-700">Name</TableHead>
                      <TableHead className="text-violet-700">Email</TableHead>
                      <TableHead className="text-violet-700">Phone</TableHead>
                      <TableHead className="text-violet-700">
                        Specialization
                      </TableHead>
                      <TableHead className="text-violet-700">Status</TableHead>
                      <TableHead className="text-right text-violet-700">
                        Action
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      Array.from({ length: 5 }).map((_, index) => (
                        <TableRow
                          key={`skeleton-${index}`}
                          className="border-b"
                        >
                          <TableCell>
                            <Skeleton className="h-6 w-6" />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Skeleton className="h-10 w-10 rounded-full" />
                              <Skeleton className="h-6 w-32" />
                            </div>
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-6 w-40" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-6 w-32" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-6 w-24" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-6 w-20" />
                          </TableCell>
                          <TableCell className="text-right">
                            <Skeleton className="h-9 w-24 ml-auto" />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : isError ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-32 text-center">
                          <div className="flex flex-col items-center justify-center text-muted-foreground">
                            <XCircle className="h-12 w-12 mb-2 text-red-400" />
                            <p className="text-lg font-medium">
                              Error loading users
                            </p>
                            <p className="text-sm">
                              Please try refreshing the page
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-32 text-center">
                          <div className="flex flex-col items-center justify-center text-muted-foreground">
                            <UsersIcon className="h-12 w-12 mb-2 text-violet-200" />
                            <p className="text-lg font-medium">No users found</p>
                            <p className="text-sm">
                              Try adjusting your search or filters
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      <AnimatePresence mode="wait">
                        {filteredUsers.map((user, index) => {
                          const specialization = getUserSpecialization(user);
                          const SpecIcon =
                            specializationIcons[
                              specialization as keyof typeof specializationIcons
                            ] || Dumbbell;

                          const status =
                            user.status ||
                            (user.isActive !== false ? "active" : "blocked");

                          return (
                            <motion.tr
                              key={user.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{
                                duration: 0.3,
                                delay: index * 0.05,
                              }}
                              className="border-b hover:bg-gray-50 group"
                            >
                              <TableCell className="font-medium">
                                {(currentPage - 1) * limit + index + 1}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar className="border-2 border-violet-100 h-10 w-10 transition-all group-hover:border-violet-300">
                                    <AvatarImage
                                      src={user.profileImage}
                                      alt={`${user.firstName} ${user.lastName}`}
                                    />
                                    <AvatarFallback className="bg-violet-100 text-violet-700">
                                      {getInitials(
                                        user.firstName,
                                        user.lastName
                                      )}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="font-medium">{`${user.firstName} ${user.lastName}`}</div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Mail className="h-4 w-4 text-violet-400" />
                                  <span className="text-sm">{user.email}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Phone className="h-4 w-4 text-violet-400" />
                                  <span className="text-sm">
                                    {user.phoneNumber || "Not provided"}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <div className="bg-violet-100 p-1 rounded-md">
                                    <SpecIcon className="h-4 w-4 text-violet-600" />
                                  </div>
                                  <span>{specialization}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={`flex items-center gap-1 w-24 justify-center ${
                                    status === "active"
                                      ? "bg-green-50 text-green-700 border-green-200"
                                      : "bg-red-50 text-red-700 border-red-200"
                                  }`}
                                >
                                  {status === "active" ? (
                                    <>
                                      <CheckCircle2 className="h-3 w-3" />{" "}
                                      Active
                                    </>
                                  ) : (
                                    <>
                                      <XCircle className="h-3 w-3" /> Blocked
                                    </>
                                  )}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleStatusToggle(user)}
                                  className={`
                                    transition-all duration-300
                                    ${
                                      status === "active"
                                        ? "bg-green-50 text-green-600 hover:bg-green-100 border-green-200"
                                        : "bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
                                    }
                                  `}
                                >
                                  {status === "active" ? (
                                    <>
                                      <UserX className="mr-2 h-4 w-4" /> Block
                                    </>
                                  ) : (
                                    <>
                                      <UserCheck className="mr-2 h-4 w-4" />{" "}
                                      Unblock
                                    </>
                                  )}
                                </Button>
                              </TableCell>
                            </motion.tr>
                          );
                        })}
                      </AnimatePresence>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Pagination */}
        {!isLoading && filteredUsers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="flex justify-center mt-4"
          >
            <Pagination1
              currentPage={currentPage}
              totalPages={totalPages}
              onPagePrev={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              onPageNext={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
            />
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}