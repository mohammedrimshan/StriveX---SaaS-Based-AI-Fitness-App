"use client";

import React, { useState } from "react";
import { IClient } from "@/types/User";
import ClientDetailModal from "./ClientDetailModal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  formatFitnessGoal,
  formatExperienceLevel,
  getBadgeColorForFitnessGoal,
  getExperienceLevelColor
} from "@/types/UserList";
import { Mail, Phone, Scale, Dumbbell, Activity, StretchVerticalIcon as Stretch, Flame, User } from 'lucide-react';
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

interface ClientListProps {
  clients: IClient[];
}

const ClientList: React.FC<ClientListProps> = ({ clients }) => {
  const [selectedClient, setSelectedClient] = useState<IClient | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openClientModal = (client: IClient) => {
    setSelectedClient(client);
    setIsModalOpen(true);
  };

  const closeClientModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedClient(null), 300);
  };

  const getGoalIcon = (goal: string) => {
    switch(goal) {
      case 'weightLoss': return <Scale className="w-4 h-4" />;
      case 'muscleGain': return <Dumbbell className="w-4 h-4" />;
      case 'endurance': return <Activity className="w-4 h-4" />;
      case 'flexibility': return <Stretch className="w-4 h-4" />;
      case 'maintenance': return <Flame className="w-4 h-4" />;
      default: return <Dumbbell className="w-4 h-4" />;
    }
  };

  const UserAvatar: React.FC<{ client: IClient }> = ({ client }) => {
    if (client.profileImage) {
      return (
        <img
          src={client.profileImage}
          alt={`${client.firstName} ${client.lastName}`}
          className="rounded-full h-10 w-10 object-cover border-2 border-purple-200 dark:border-purple-900"
        />
      );
    }

    return (
      <div className="rounded-full h-10 w-10 bg-gradient-to-br from-purple-400 to-purple-600 dark:from-purple-500 dark:to-purple-700 border-2 border-purple-200 dark:border-purple-900 flex items-center justify-center">
        <User className="h-5 w-5 text-white" />
      </div>
    );
  };

  return (
    <motion.div 
      className="rounded-xl overflow-hidden bg-white dark:bg-gray-800 shadow-xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 dark:bg-gray-900/50">
              <TableHead className="w-[50px]">Profile</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Fitness Goal</TableHead>
              <TableHead>Experience</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((client, index) => (
              <motion.tr
                key={client.id}
                className="cursor-pointer hover:bg-purple-50 dark:hover:bg-gray-700/50 transition-colors"
                onClick={() => openClientModal(client)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <TableCell>
                  <motion.div 
                    className="relative flex h-10 w-10"
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <UserAvatar client={client} />
                  </motion.div>
                </TableCell>
                <TableCell className="font-medium">
                  {client.firstName} {client.lastName}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col text-sm">
                    <span className="flex items-center space-x-1">
                      <Mail className="h-3.5 w-3.5 text-purple-500" />
                      <span className="text-gray-600 dark:text-gray-300">{client.email}</span>
                    </span>
                    <span className="flex items-center space-x-1 mt-1">
                      <Phone className="h-3.5 w-3.5 text-purple-500" />
                      <span className="text-gray-600 dark:text-gray-300">{client.phoneNumber || "N/A"}</span>
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    className={`flex items-center gap-1.5 px-3 py-1.5 ${getBadgeColorForFitnessGoal(
                      client.fitnessGoal ?? "N/A"
                    )}`}
                  >
                    {getGoalIcon(client.fitnessGoal ?? "")}
                    <span>{formatFitnessGoal(client.fitnessGoal ?? "N/A")}</span>
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${getExperienceLevelColor(client.experienceLevel || "N/A")}`}>
                    {formatExperienceLevel(client.experienceLevel || "N/A")}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-gray-600 dark:text-gray-300">
                  {format(new Date(client.createdAt || new Date()), "MMM dd, yyyy")}
                  </span>
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </div>

      <ClientDetailModal
        client={selectedClient}
        isOpen={isModalOpen}
        onClose={closeClientModal}
      />
    </motion.div>
  );
};

export default ClientList;