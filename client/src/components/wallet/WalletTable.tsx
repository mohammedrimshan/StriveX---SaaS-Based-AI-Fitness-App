import React from 'react';
import { WalletRecord } from '../../types/wallet';
import { formatCurrency, formatDateTime } from '../../utils/dateUtils';
import { 
  User, 
  Crown,  
  TrendingUp, 
  Percent, 
  Clock,
  Star,
} from 'lucide-react';

interface WalletTableProps {
  data: WalletRecord[];
}

export const WalletTable: React.FC<WalletTableProps> = ({ data }) => {
  return (
    <div className="hidden lg:block overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-gradient-to-r from-slate-50 to-gray-100 border-b-2 border-blue-100">
            <th className="px-4 py-3 text-left">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-800 uppercase">
                <User className="w-3 h-3 text-blue-600" />
                Client
              </div>
            </th>
            <th className="px-4 py-3 text-left">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-800 uppercase">
                <Crown className="w-3 h-3 text-purple-600" />
                Plan
              </div>
            </th>
        
            <th className="px-4 py-3 text-left">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-800 uppercase">
                <TrendingUp className="w-3 h-3 text-blue-600" />
                Earnings
              </div>
            </th>
            <th className="px-4 py-3 text-left">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-800 uppercase">
                <Percent className="w-3 h-3 text-purple-600" />
                Commission
              </div>
            </th>
            <th className="px-4 py-3 text-left">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-800 uppercase">
                <Clock className="w-3 h-3 text-gray-600" />
                Date
              </div>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map((record, index) => (
            <tr
              key={record.id}
              className={`group transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:shadow-md ${
                index % 2 === 0 ? "bg-white" : "bg-gray-50/30"
              }`}
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs">
                    {record.clientName.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium text-sm text-gray-900 truncate">
                    {record.clientName}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-blue-100 text-blue-800">
                  <Star className="w-3 h-3 text-yellow-500" />
                  {record.planTitle}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="font-semibold text-sm text-blue-700">
                  {formatCurrency(record.trainerAmount)}
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="font-semibold text-sm text-purple-700">
                  {formatCurrency(record.adminShare)}
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="text-sm text-gray-600">
                  {formatDateTime(record.completedAt)}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Compact Empty State */}
      {data.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 px-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-3">
            <TrendingUp className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-sm font-semibold text-gray-900 mb-1">No earnings data</h3>
          <p className="text-xs text-gray-500 text-center">
            Earnings will appear once clients subscribe to your plans
          </p>
        </div>
      )}
    </div>
  );
};