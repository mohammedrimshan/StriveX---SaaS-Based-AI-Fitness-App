"use client";

import React from "react";
import { Users } from "lucide-react";
import { SessionItem } from "@/types/Session";
import { UserRole } from "@/types/UserRole";
import SessionCard from "./SessionCard";
import EmptyState from "./EmptyState";

interface SessionCardsProps {
  filteredItems: SessionItem[];
  searchTerm: string;
  role: UserRole;
}

const SessionCards: React.FC<SessionCardsProps> = ({ filteredItems, searchTerm, role }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/20">
        <Users className="text-xl text-blue-600" size={20} />
        <h2 className="text-xl font-bold text-gray-900">Sessions ({filteredItems.length})</h2>
      </div>

      {filteredItems.length === 0 ? (
        <EmptyState searchTerm={searchTerm} />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredItems.map((item, index) => (
            <SessionCard key={item.id || index} item={item} index={index} role={role} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SessionCards;