// src/components/trainers/TrainerSearchBar.tsx
import React, { useState } from 'react';
import { FaSearch, FaFilter } from 'react-icons/fa';
import { motion } from 'framer-motion';

interface TrainerSearchBarProps {
  onSearch: (value: string) => void;
}

const TrainerSearchBar: React.FC<TrainerSearchBarProps> = ({ onSearch }) => {
  const [searchValue, setSearchValue] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchValue);
  };

  return (
    <motion.div 
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="mb-8"
    >
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search trainers by name, specialization, or skills..."
            className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Search
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-3 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            <FaFilter />
          </motion.button>
        </div>
      </form>
      
      {isExpanded && (
        <motion.div 
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-4 p-4 bg-white rounded-md shadow-md"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
              <select className="w-full p-2 border border-gray-300 rounded-md">
                <option value="">All Specializations</option>
                <option value="weightLoss">Weight Loss</option>
                <option value="muscleGain">Muscle Gain</option>
                <option value="yoga">Yoga</option>
                <option value="crossfit">CrossFit</option>
                <option value="pilates">Pilates</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
              <select className="w-full p-2 border border-gray-300 rounded-md">
                <option value="">Any Experience</option>
                <option value="1-3">1-3 years</option>
                <option value="4-6">4-6 years</option>
                <option value="7-10">7-10 years</option>
                <option value="10+">10+ years</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Certification</label>
              <select className="w-full p-2 border border-gray-300 rounded-md">
                <option value="">Any Certification</option>
                <option value="nasm">NASM</option>
                <option value="ace">ACE</option>
                <option value="issa">ISSA</option>
                <option value="acsm">ACSM</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Apply Filters
            </motion.button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default TrainerSearchBar;