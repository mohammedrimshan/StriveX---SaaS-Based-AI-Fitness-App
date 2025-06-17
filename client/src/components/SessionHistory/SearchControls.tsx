import React from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaFileExport, FaDownload } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SearchControlsProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onExportCSV: () => void;
  onExportPDF: () => void;
   totalResults: number
    isLoading: boolean
}

const SearchControls: React.FC<SearchControlsProps> = ({
  searchTerm,
  onSearchChange,
  onExportCSV,
  onExportPDF
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="flex flex-col lg:flex-row gap-6 items-center justify-between"
    >
      <div className="relative w-full lg:w-96">
        <motion.div
          className="absolute left-4 top-1/2 transform -translate-y-1/2"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <FaSearch className="h-5 w-5 text-cyan-600" />
        </motion.div>
        <Input
          type="text"
          placeholder="Search by Trainer or Client name..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-12 w-full bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500 rounded-xl focus:border-cyan-500 transition-all duration-300"
        />
      </div>

      <div className="flex gap-4">
        <motion.div
          whileHover={{ scale: 1.05, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={onExportCSV}
            variant="outline"
            className="flex items-center gap-3 bg-white border-gray-300 text-gray-900 hover:bg-gradient-to-r hover:from-emerald-500 hover:to-cyan-600 hover:text-white hover:border-transparent transition-all duration-300 rounded-xl px-6 py-3"
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <FaFileExport className="h-4 w-4" />
            </motion.div>
            Export CSV
          </Button>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05, rotate: -5 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            onClick={onExportPDF}
            variant="outline"
            className="flex items-center gap-3 bg-white border-gray-300 text-gray-900 hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-600 hover:text-white hover:border-transparent transition-all duration-300 rounded-xl px-6 py-3"
          >
            <motion.div
              animate={{ y: [0, -2, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <FaDownload className="h-4 w-4" />
            </motion.div>
            Export PDF
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default SearchControls;