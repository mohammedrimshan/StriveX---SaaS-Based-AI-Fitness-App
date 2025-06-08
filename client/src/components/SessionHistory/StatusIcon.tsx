import React from 'react';
import {
  FaPlayCircle,
  FaStopCircle,
  FaVideoSlash,
  FaPause,
  FaBookmark,
  FaBan,
  FaCheckCircle,
  FaClock
} from 'react-icons/fa';

// Get status icon
export const getStatusIcon = (status: string): React.ReactElement => {
  switch (status.toLowerCase()) {
    case 'booked':
      return <FaBookmark className="h-3 w-3 text-blue-600" />;
    case 'cancelled':
      return <FaBan className="h-3 w-3 text-red-600" />;
    case 'completed':
      return <FaCheckCircle className="h-3 w-3 text-green-600" />;
    default:
      return <FaClock className="h-3 w-3 text-gray-600" />;
  }
};

// Get call status icon
export const getCallStatusIcon = (status: string): React.ReactElement => {
  switch (status.toLowerCase()) {
    case 'started':
      return <FaPlayCircle className="h-4 w-4 text-green-600" />;
    case 'ended':
      return <FaStopCircle className="h-4 w-4 text-gray-600" />;
    case 'not started':
      return <FaVideoSlash className="h-4 w-4 text-red-600" />;
    default:
      return <FaPause className="h-4 w-4 text-yellow-600" />;
  }
};