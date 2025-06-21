"use client";

import React from "react";
import { IClient } from "@/types/User";
import { motion } from "framer-motion";
import { Mail, Phone, Calendar, Award, User } from 'lucide-react';
import {
  formatFitnessGoal,
  formatExperienceLevel,
  getBadgeColorForFitnessGoal,
  getExperienceLevelColor
} from "@/types/UserList";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface ClientCardProps {
  client: IClient;
  onClick: () => void;
}

const ClientCard: React.FC<ClientCardProps> = ({ client, onClick }) => {
  const UserAvatar: React.FC<{ client: IClient }> = ({ client }) => {
    if (client.profileImage) {
      return (
        <img
          src={client.profileImage}
          alt={`${client.firstName} ${client.lastName}`}
          className="w-24 h-24 object-cover rounded-full border-4 border-white dark:border-gray-800 shadow-md"
        />
      );
    }

    return (
      <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-purple-600 dark:from-purple-500 dark:to-purple-700 rounded-full border-4 border-white dark:border-gray-800 shadow-md flex items-center justify-center">
        <User className="w-10 h-10 text-white" />
      </div>
    );
  };

  return (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden h-full cursor-pointer"
      whileHover={{ 
        y: -5,
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        background: "linear-gradient(to bottom right, rgba(255, 255, 255, 1), rgba(249, 250, 251, 1))",
      }}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative h-32 bg-gradient-to-r from-purple-500 to-pink-500">
        <motion.div 
          className="absolute -bottom-12 left-1/2 transform -translate-x-1/2"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <UserAvatar client={client} />
        </motion.div>
      </div>

      <div className="pt-14 pb-6 px-4 flex flex-col items-center">
        <h3 className="font-bold text-lg mb-1 text-center">
          {client.firstName} {client.lastName}
        </h3>

        <Badge
          className={`mb-3 flex items-center gap-1.5 px-3 py-1 ${getBadgeColorForFitnessGoal(
            client.fitnessGoal ?? "N/A"
          )}`}
        >
          {formatFitnessGoal(client.fitnessGoal || "N/A")}
        </Badge>

        <div className="w-full space-y-2 mt-2">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            <Mail className="w-4 h-4 mr-2 text-purple-500" />
            <span className="truncate">{client.email}</span>
          </div>

          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            <Phone className="w-4 h-4 mr-2 text-purple-500" />
            <span>{client.phoneNumber || "N/A"}</span>
          </div>

          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            <Calendar className="w-4 h-4 mr-2 text-purple-500" />
            <span>{format(new Date(client.createdAt || new Date()), "MMM dd, yyyy")}</span>
          </div>

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${getExperienceLevelColor(client.experienceLevel || "N/A")}`}>
              {formatExperienceLevel(client.experienceLevel || "N/A")}
            </span>
            
            {client.isPremium && (
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800 flex items-center gap-1">
                <Award className="w-3 h-3" />
                <span>Premium</span>
              </Badge>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ClientCard;