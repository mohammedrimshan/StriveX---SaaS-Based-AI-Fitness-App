"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  CheckCircle,
  XCircle,
  RefreshCw,
  Award,
  Mail,
  Phone,
  Calendar,
  User2,
  Briefcase,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/common/Pagination/Pagination";
import { RejectionModal } from "@/components/modals/RejectModal";
import { useToaster } from "@/hooks/ui/useToaster";
import {
  getAllUsers,
  updateTrainerApprovalStatus,
} from "@/services/admin/adminService";
import { debounce } from "lodash";
import { ITrainer } from "@/types/User";



export default function TrainerVerification() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
  const [currentPage, setCurrentPage] = useState(1);
  const [trainers, setTrainers] = useState<ITrainer[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState<ITrainer | null>(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  const limit = 5;
  const { successToast, errorToast } = useToaster();

  // Handle debounced search
  useEffect(() => {
    const handler = debounce(() => setDebouncedSearch(searchQuery), 300);
    handler();
    return () => handler.cancel();
  }, [searchQuery]);

  // Fetch pending trainers
  useEffect(() => {
    const fetchPendingTrainers = async () => {
      try {
        setIsLoading(true);
        const response = await getAllUsers<ITrainer>({
          userType: "trainer",
          page: currentPage,
          limit,
          search: debouncedSearch,
        });

        // Filter for pending trainers only
        const pendingTrainers = response.users.filter(
          (trainer) => trainer.approvalStatus === "pending"
        );
        console.log(pendingTrainers);
        setTrainers(pendingTrainers);
        setTotalPages(response.totalPages);
      } catch (error) {
        errorToast("Failed to fetch trainers");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPendingTrainers();
  }, [currentPage, debouncedSearch]);

  // Handle trainer status update
  const handleStatusUpdate = async (
    trainer: ITrainer,
    status: "approved" | "rejected",
  ) => {
    try {
      if (status === "rejected") {
        setSelectedTrainer(trainer);
        setIsRejectModalOpen(true);
        return;
      }

      console.log("Sending update request:", {
        clientId: trainer.id,
        approvalStatus: status.toUpperCase(),
      });
      await updateTrainerApprovalStatus({
        trainerId: trainer.id,
        status,
      });

      successToast(`Trainer ${status} successfully`);
      setTrainers((prev) => prev.filter((t) => t.id !== trainer.id));
    } catch (error: any) {
      console.error("Update failed:", error.message, error.response?.data);
      errorToast(error.message || "Failed to update trainer status");
    }
  };

  const handleRejectSubmit = async (reason: string) => { // Remove category from params
    if (!selectedTrainer) return;
  
    try {
      console.log("Sending reject request:", { 
        clientId: selectedTrainer.id, 
        approvalStatus: "rejected", 
        rejectionReason: reason 
      });
      await updateTrainerApprovalStatus({
        trainerId: selectedTrainer.id,
        status: "rejected",
        reason, // Pass only reason, not category
      });
      
      successToast("Trainer rejected successfully");
      setTrainers((prev) => prev.filter((t) => t.id !== selectedTrainer.id));
      setIsRejectModalOpen(false);
      setSelectedTrainer(null);
    } catch (error: any) {
      console.error("Reject failed:", error.message, error.response?.data);
      errorToast(error.message || "Failed to reject trainer");
    }
  };

  // Utility functions
  const getInitials = (firstName: string, lastName: string) =>
    `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

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
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 p-2 rounded-lg">
              <Award className="h-6 w-6 text-orange-600" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              Trainer Verification
            </h1>
            <Badge
              variant="outline"
              className="ml-2 bg-orange-50 text-orange-700 border-orange-200"
            >
              {trainers.length} pending
            </Badge>
          </div>

          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={() => setCurrentPage(1)} // Trigger refresh
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search trainers by name or email..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10 border-orange-200 focus-visible:ring-orange-500"
          />
        </div>

        {/* Trainers Table */}
        <Card className="border-orange-100 overflow-hidden w-full">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-orange-50">
                <TableRow>
                  <TableHead className="text-orange-700">#</TableHead>
                  <TableHead className="text-orange-700">Name</TableHead>
                  <TableHead className="text-orange-700">Email</TableHead>
                  <TableHead className="text-orange-700">Phone</TableHead>
                  <TableHead className="text-orange-700">
                    Date of Birth
                  </TableHead>
                  <TableHead className="text-orange-700">Gender</TableHead>
                  <TableHead className="text-orange-700">Experience</TableHead>
                  <TableHead className="text-orange-700">Skills</TableHead>
                  <TableHead className="text-right text-orange-700">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={`skeleton-${index}`}>
                      <TableCell>
                        <Skeleton className="h-6 w-6" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-32" />
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
                        <Skeleton className="h-6 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-32" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-9 w-24 ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : trainers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-32 text-center">
                      No pending trainers found
                    </TableCell>
                  </TableRow>
                ) : (
                  <AnimatePresence>
                    {trainers.map((trainer, index) => (
                      <motion.tr
                        key={trainer.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-orange-50/50"
                      >
                        <TableCell>
                          {(currentPage - 1) * limit + index + 1}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={trainer.profileImage} />
                              <AvatarFallback>
                                {getInitials(
                                  trainer.firstName,
                                  trainer.lastName
                                )}
                              </AvatarFallback>
                            </Avatar>
                            {`${trainer.firstName} ${trainer.lastName}`}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-orange-400" />
                            {trainer.email}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-orange-400" />
                            {trainer.phoneNumber || "N/A"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-orange-400" />
                            {trainer.dateOfBirth}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User2 className="h-4 w-4 text-orange-400" />
                            {trainer.gender}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-orange-400" />
                            {trainer.experience}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {trainer?.skills?.map((skill) => (
                              <Badge key={skill} variant="outline">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleStatusUpdate(trainer, "approved")
                              }
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleStatusUpdate(trainer, "rejected")
                              }
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Reject
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}

        {/* Rejection Modal */}
        <RejectionModal
          isOpen={isRejectModalOpen}
          onClose={() => setIsRejectModalOpen(false)}
          onSubmit={(reason, _) => handleRejectSubmit(reason)} // Ignore category
          trainerName={
            selectedTrainer
              ? `${selectedTrainer.firstName} ${selectedTrainer.lastName}`
              : ""
          }
        />
      </motion.div>
    </div>
  );
}
