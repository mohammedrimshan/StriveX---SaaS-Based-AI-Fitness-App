import React from 'react';
import { motion } from 'framer-motion';
import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FaUserTie, FaUser, FaCalendarAlt, FaClock, FaHistory, FaChevronRight } from 'react-icons/fa';
import { SessionItem } from '@/types/Session';
import { UserRole } from '@/types/UserRole';
import { formatDate, formatTime, formatBookedAt, getStatusVariant } from '@/utils/sessionUtil';
import { getStatusIcon, getCallStatusIcon } from './StatusIcon';

interface SessionTableRowProps {
  item: SessionItem;
  index: number;
  role: UserRole;
}

const SessionTableRow: React.FC<SessionTableRowProps> = ({ item, index, role }) => {
  return (
    <TableRow
      key={item.id || index}
      className="border-gray-200 hover:bg-gray-50 transition-all duration-300 group"
    >
      {role !== 'trainer' && (
        <TableCell className="font-medium text-gray-900">
          <div className="flex items-center gap-2">
            <FaUserTie className="h-3 w-3 text-purple-500" />
            {item.trainerName}
          </div>
        </TableCell>
      )}
      {role !== 'client' && (
        <TableCell className="font-medium text-gray-900">
          <div className="flex items-center gap-2">
            <FaUser className="h-3 w-3 text-blue-500" />
            {item.clientName}
          </div>
        </TableCell>
      )}
      <TableCell className="text-gray-700">
        <div className="flex items-center gap-2">
          <FaCalendarAlt className="h-3 w-3 text-green-500" />
          {formatDate(item.date)}
        </div>
      </TableCell>
      <TableCell className="text-gray-700">
        <div className="flex items-center gap-2">
          <FaClock className="h-3 w-3 text-orange-500" />
          {formatTime(item.startTime)} – {formatTime(item.endTime)}
        </div>
      </TableCell>
      <TableCell>
        <Badge
          variant={getStatusVariant(item.status)}
          className={`capitalize font-medium flex items-center gap-1 ${
            item.status === 'completed'
              ? 'bg-green-100 text-green-800 border-green-200'
              : item.status === 'cancelled'
              ? 'bg-red-100 text-red-800 border-red-200'
              : 'bg-blue-100 text-blue-800 border-blue-200'
          }`}
        >
          {getStatusIcon(item.status)}
          {item.status}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-3">
          <motion.div whileHover={{ scale: 1.2 }} transition={{ duration: 0.2 }}>
            {getCallStatusIcon(item.videoCallStatus)}
          </motion.div>
          <span className="capitalize text-sm text-gray-700 flex items-center gap-1">
            {item.videoCallStatus}
            <FaChevronRight className="h-2 w-2 text-gray-400" />
          </span>
        </div>
      </TableCell>
      <TableCell className="text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <FaHistory className="h-3 w-3 text-indigo-500" />
          {formatBookedAt(item.bookedAt)}
        </div>
      </TableCell>
    </TableRow>
  );
};

export default SessionTableRow;