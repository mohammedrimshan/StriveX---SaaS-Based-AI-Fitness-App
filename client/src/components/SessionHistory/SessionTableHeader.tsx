import React from 'react';
import { TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FaUserTie, FaUser, FaCalendarAlt, FaClock, FaCheckCircle, FaVideo, FaHistory } from 'react-icons/fa';
import { UserRole } from '@/types/UserRole';

interface SessionTableHeaderProps {
  role: UserRole;
}

const SessionTableHeader: React.FC<SessionTableHeaderProps> = ({ role }) => {
  return (
    <TableHeader className="sticky top-0 bg-gray-50 z-10">
      <TableRow className="border-gray-200">
        {role !== 'trainer' && (
          <TableHead className="font-bold text-gray-900 text-base">
            <div className="flex items-center gap-2">
              <FaUserTie className="h-4 w-4 text-purple-600" />
              Trainer Name
            </div>
          </TableHead>
        )}
        {role !== 'client' && (
          <TableHead className="font-bold text-gray-900 text-base">
            <div className="flex items-center gap-2">
              <FaUser className="h-4 w-4 text-blue-600" />
              Client Name
            </div>
          </TableHead>
        )}
        <TableHead className="font-bold text-gray-900 text-base">
          <div className="flex items-center gap-2">
            <FaCalendarAlt className="h-4 w-4 text-green-600" />
            Date
          </div>
        </TableHead>
        <TableHead className="font-bold text-gray-900 text-base">
          <div className="flex items-center gap-2">
            <FaClock className="h-4 w-4 text-orange-600" />
            Time
          </div>
        </TableHead>
        <TableHead className="font-bold text-gray-900 text-base">
          <div className="flex items-center gap-2">
            <FaCheckCircle className="h-4 w-4 text-emerald-600" />
            Status
          </div>
        </TableHead>
        <TableHead className="font-bold text-gray-900 text-base">
          <div className="flex items-center gap-2">
            <FaVideo className="h-4 w-4 text-red-600" />
            Call Status
          </div>
        </TableHead>
        <TableHead className="font-bold text-gray-900 text-base">
          <div className="flex items-center gap-2">
            <FaHistory className="h-4 w-4 text-indigo-600" />
            Booked At
          </div>
        </TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default SessionTableHeader;