import React from 'react';
import { FileSpreadsheet, FileText, Filter, X } from 'lucide-react';
import { DatePicker } from './DatePicker';

interface FilterControlsProps {
  startDate?: Date;
  endDate?: Date;
  onStartDateChange: (date: Date | undefined) => void;
  onEndDateChange: (date: Date | undefined) => void;
  status?: string;
  onStatusChange: (status: string | undefined) => void;
  onClearFilters: () => void;
  onExportCSV: () => void;
  onExportPDF: () => void;
}

export const FilterControls: React.FC<FilterControlsProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  status,
  onStatusChange,
  onClearFilters,
  onExportCSV,
  onExportPDF,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  return (
    <div className="bg-white rounded-2xl shadow-lg mb-6 overflow-hidden">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-blue-500" />
          <span className="font-semibold text-gray-700">Filters & Export</span>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
        >
          {isExpanded ? (
            <X className="w-5 h-5 text-gray-500" />
          ) : (
            <Filter className="w-5 h-5 text-gray-500" />
          )}
        </button>
      </div>

      {/* Desktop Layout & Mobile Expanded Content */}
      <div className={`p-6 ${!isExpanded ? 'hidden md:block' : ''}`}>
        {/* Desktop Layout */}
        <div className="hidden md:flex flex-col lg:flex-row gap-6 items-end lg:items-end justify-between">
          {/* Date Range and Status Filters */}
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <DatePicker
              selected={startDate}
              onSelect={onStartDateChange}
              placeholder="Pick start date"
              label="Start Date"
            />
            <DatePicker
              selected={endDate}
              onSelect={onEndDateChange}
              placeholder="Pick end date"
              label="End Date"
            />
            <div className="flex flex-col gap-3">
              <label className="text-sm font-bold text-gray-700">
                Status
              </label>
              <select
                value={status || ''}
                onChange={(e) => onStatusChange(e.target.value || undefined)}
                className="px-4 py-3 border-2 border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 w-[200px]"
              >
                <option value="">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>

          {/* Export Buttons */}
          <div className="flex gap-3 items-end">
            <button
              onClick={onClearFilters}
              className="px-4 py-3 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors duration-200 h-[48px]"
            >
              Clear Filters
            </button>
            <button
              onClick={onExportCSV}
              className="flex items-center px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-all duration-200 transform hover:scale-105 h-[48px] text-xs"
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Export CSV
            </button>
            <button
              onClick={onExportPDF}
              className="flex items-center px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all duration-200 transform hover:scale-105 h-[48px] text-xs"
            >
              <FileText className="mr-2 h-4 w-4" />
              Export PDF
            </button>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden space-y-6">
          {/* Filters Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <Filter className="w-4 h-4 text-blue-500" />
              Filter Options
            </h3>
            
            {/* Date Range - Stacked on Mobile */}
            <div className="space-y-4">
              <div className="w-full">
                <DatePicker
                  selected={startDate}
                  onSelect={onStartDateChange}
                  placeholder="Pick start date"
                  label="Start Date"
                />
              </div>
              <div className="w-full">
                <DatePicker
                  selected={endDate}
                  onSelect={onEndDateChange}
                  placeholder="Pick end date"
                  label="End Date"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex flex-col gap-3">
              <label className="text-sm font-bold text-gray-700">
                Status
              </label>
              <select
                value={status || ''}
                onChange={(e) => onStatusChange(e.target.value || undefined)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
              >
                <option value="">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100"></div>

          {/* Actions Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-700">Actions</h3>
            
            {/* Clear Filters Button */}
            <button
              onClick={onClearFilters}
              className="w-full px-4 py-3 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors duration-200 font-medium"
            >
              Clear All Filters
            </button>

            {/* Export Buttons - Full width on mobile */}
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={onExportCSV}
                className="flex items-center justify-center px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-all duration-200 transform active:scale-95 text-sm font-medium"
              >
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Export as CSV
              </button>
              <button
                onClick={onExportPDF}
                className="flex items-center justify-center px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all duration-200 transform active:scale-95 text-sm font-medium"
              >
                <FileText className="mr-2 h-4 w-4" />
                Export as PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Quick Actions (when collapsed) */}
      {!isExpanded && (
        <div className="md:hidden px-4 pb-4">
          <div className="flex gap-2">
            <button
              onClick={onExportCSV}
              className="flex-1 flex items-center justify-center px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-200 text-xs font-medium"
            >
              <FileSpreadsheet className="mr-1 h-3 w-3" />
              CSV
            </button>
            <button
              onClick={onExportPDF}
              className="flex-1 flex items-center justify-center px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-200 text-xs font-medium"
            >
              <FileText className="mr-1 h-3 w-3" />
              PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
};