"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  UserCheck,
  UserX,
  SpaceIcon as Yoga,
  Dumbbell,
  Brain,
  Heart,
  MonitorIcon as Running,
  RefreshCw,
  Download,
  CheckCircle2,
  XCircle,
  UsersIcon,
  Mail,
  Phone,
  Medal,
  Clock,
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
import { IClient, ITrainer } from "@/types/User";

// Define specialization types and their icons
const specializationIcons = {
  Yoga: Yoga,
  Meditation: Brain,
  Workout: Dumbbell,
  Cardio: Heart,
  Running: Running,
};

export default function UsersPage({
  userType = "client",
}: {
  userType?: "client" | "trainer";
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilters, setActiveFilters] = useState({
    status: [] as string[],
    specialization: [] as string[],
  });

  const limit = 10;
  const { mutate: updateUserStatus } = useUpdateUserStatusMutation();
  const { errorToast, successToast } = useToaster();

  // Handle debounced search
  useEffect(() => {
    const handler = debounce(() => setDebouncedSearch(searchQuery), 300);
    handler();
    return () => handler.cancel();
  }, [searchQuery]);

  // Fetch users data from backend
  const { data, isLoading, isError, refetch } = useAllUsersQuery<
    IClient | ITrainer
  >(getAllUsers, currentPage, limit, debouncedSearch, userType);

  // Apply client-side filtering for trainers
  const filteredUsers =
    data?.users.filter((user) => {
      if (userType === "trainer") {
        const trainer = user as ITrainer;
        return (
          trainer.approvalStatus === "approved" &&
          trainer.approvedByAdmin === true
        );
      }
      return true; // No filtering for clients
    }) || [];

  // Use totalPages and totalUsers from server response
  const totalPages = data?.totalPages || 1;
  const totalUsers = data?.totalPages ? data.totalPages * limit : 0; // Estimate total users for display

  useEffect(() => {
    if (userType === "trainer" && filteredUsers.length > 0) {
      console.log("Approved Trainers List:", filteredUsers);
    }
  }, [userType, filteredUsers]);

  // Handle user status toggle
  const handleStatusToggle = (user: IClient | ITrainer) => {
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

  // Get user specialization (for client) or discipline (for trainer)
  const getUserSpecialization = (user: IClient | ITrainer) => {
    if (userType === "client") {
      const client = user as IClient;
      return client.preferredWorkout || client.preferences?.[0] || "Workout";
    } else {
      const trainer = user as ITrainer;
      return trainer.specialization?.[0] || trainer.skills?.[0] || "Workout";
    }
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
            <div
              className={`p-2 rounded-lg ${
                userType === "client" ? "bg-violet-100" : "bg-orange-100"
              }`}
            >
              <UsersIcon
                className={`h-6 w-6 ${
                  userType === "client" ? "text-violet-600" : "text-orange-600"
                }`}
              />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              {userType === "client" ? "Users" : "Trainers"}
            </h1>
            <Badge
              variant="outline"
              className={`ml-2 ${
                userType === "client"
                  ? "bg-violet-50 text-violet-700 border-violet-200"
                  : "bg-orange-50 text-orange-700 border-orange-200"
              }`}
            >
              {totalUsers || 0} total
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
              placeholder={`Search ${
                userType === "client" ? "users" : "trainers"
              } by name, email or phone...`}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className={`pl-10 ${
                userType === "client"
                  ? "border-violet-200 focus-visible:ring-violet-500"
                  : "border-orange-200 focus-visible:ring-orange-500"
              }`}
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
          <Card
            className={`overflow-hidden w-full ${
              userType === "client" ? "border-violet-100" : "border-orange-100"
            }`}
          >
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader
                    className={
                      userType === "client" ? "bg-violet-50" : "bg-orange-50"
                    }
                  >
                    <TableRow className="border-b">
                      <TableHead
                        className={`w-12 text-${
                          userType === "client" ? "violet" : "orange"
                        }-700`}
                      >
                        #
                      </TableHead>
                      <TableHead
                        className={`text-${
                          userType === "client" ? "violet" : "orange"
                        }-700`}
                      >
                        Name
                      </TableHead>
                      <TableHead
                        className={`text-${
                          userType === "client" ? "violet" : "orange"
                        }-700`}
                      >
                        Email
                      </TableHead>
                      <TableHead
                        className={`text-${
                          userType === "client" ? "violet" : "orange"
                        }-700`}
                      >
                        Phone
                      </TableHead>
                      {userType === "client" ? (
                        <TableHead className="text-violet-700">
                          Specialization
                        </TableHead>
                      ) : (
                        <TableHead className="text-orange-700">
                          Experience
                        </TableHead>
                      )}
                      <TableHead
                        className={`text-${
                          userType === "client" ? "violet" : "orange"
                        }-700`}
                      >
                        Status
                      </TableHead>
                      <TableHead
                        className={`text-right text-${
                          userType === "client" ? "violet" : "orange"
                        }-700`}
                      >
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
                              Error loading{" "}
                              {userType === "client" ? "users" : "trainers"}
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
                            {userType === "trainer" ? (
                              <>
                                <Clock className="h-12 w-12 mb-2 text-orange-200" />
                                <p className="text-lg font-medium">
                                  No approved trainers found
                                </p>
                                <p className="text-sm">
                                  Only trainers with approved status are shown
                                </p>
                              </>
                            ) : (
                              <>
                                <UsersIcon className="h-12 w-12 mb-2 text-violet-200" />
                                <p className="text-lg font-medium">
                                  No users found
                                </p>
                                <p className="text-sm">
                                  Try adjusting your search or filters
                                </p>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      <AnimatePresence mode="wait">
                        {filteredUsers.map((user, index) => {
                          const specialization = getUserSpecialization(user);
                          const SpecIcon =
                            userType === "client"
                              ? specializationIcons[
                                  specialization as keyof typeof specializationIcons
                                ] || Dumbbell
                              : Medal;

                          const status =
                            user.status ||
                            (user.isActive !== false ? "active" : "blocked");
                          const baseColor =
                            userType === "client" ? "violet" : "orange";

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
                                  <Avatar
                                    className={`border-2 border-${baseColor}-100 h-10 w-10 transition-all group-hover:border-${baseColor}-300`}
                                  >
                                    <AvatarImage
                                      src={user.profileImage}
                                      alt={`${user.firstName} ${user.lastName}`}
                                    />
                                    <AvatarFallback
                                      className={`bg-${baseColor}-100 text-${baseColor}-700`}
                                    >
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
                                  <Mail
                                    className={`h-4 w-4 text-${baseColor}-400`}
                                  />
                                  <span className="text-sm">{user.email}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Phone
                                    className={`h-4 w-4 text-${baseColor}-400`}
                                  />
                                  <span className="text-sm">
                                    {user.phoneNumber || "Not provided"}
                                  </span>
                                </div>
                              </TableCell>
                              {userType === "client" ? (
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <div className="bg-violet-100 p-1 rounded-md">
                                      <SpecIcon className="h-4 w-4 text-violet-600" />
                                    </div>
                                    <span>{specialization}</span>
                                  </div>
                                </TableCell>
                              ) : (
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <div className="bg-orange-100 p-1 rounded-md">
                                      <Medal className="h-4 w-4 text-orange-600" />
                                    </div>
                                    <span>
                                      {(user as ITrainer).experience || 0} years
                                    </span>
                                  </div>
                                </TableCell>
                              )}
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
        {!isLoading && totalPages > 0 && (
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
              onPageSelect={(page) => setCurrentPage(page)} // Handle direct page selection
            />
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}