"use client"

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, UserCheck, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import AdminBackupClientsList from '@/components/BackupTrainer/AdminBackupClientsList';
import AdminTrainerRequest from '@/components/BackupTrainer/AdminTrainerRequest';

const AdminDashboardTabs = () => {
  const [activeTab, setActiveTab] = useState("backup-clients");

  return (
    <div className="min-h-screen bg-white mt-15">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Enhanced Header Section */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-full mb-6 shadow-2xl">
            <Shield className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Admin Management Center
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Comprehensive dashboard for managing backup clients and trainer requests with advanced controls and insights
          </p>
          <div className="mt-6 h-1 w-32 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 mx-auto rounded-full"></div>
        </motion.div>

        {/* Enhanced Tabs Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex justify-center mb-8">
              <TabsList className="grid w-full max-w-md grid-cols-2 bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg rounded-xl p-1">
                <TabsTrigger 
                  value="backup-clients" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg transition-all duration-300 font-semibold text-sm py-3"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Backup Clients
                </TabsTrigger>
                <TabsTrigger 
                  value="trainer-requests" 
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg transition-all duration-300 font-semibold text-sm py-3"
                >
                  <UserCheck className="h-4 w-4 mr-2" />
                  Trainer Requests
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="backup-clients" className="mt-0">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full bg-white/60 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 overflow-hidden"
              >
                <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 p-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Backup Clients Management</h2>
                      <p className="text-blue-100">Monitor and manage all backup client relationships</p>
                    </div>
                  </div>
                </div>
                <div className="p-6 w-full overflow-x-auto">
                  <div className="min-w-full">
                    <AdminBackupClientsList />
                  </div>
                </div>
              </motion.div>
            </TabsContent>

            <TabsContent value="trainer-requests" className="mt-0">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full bg-white/60 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 overflow-hidden"
              >
                <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 p-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <UserCheck className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Trainer Change Requests</h2>
                      <p className="text-purple-100">Review and process trainer change requests</p>
                    </div>
                  </div>
                </div>
                <div className="p-6 w-full overflow-x-auto">
                  <div className="min-w-full">
                    <AdminTrainerRequest />
                  </div>
                </div>
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboardTabs;