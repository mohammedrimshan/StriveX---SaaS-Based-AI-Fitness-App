import React from 'react';
import { User, Mail, Phone, Target, Calendar, Clock, Award, Activity, Zap, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';

export interface BackupClient {
  id: string;
  clientId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  profileImage?: string;
  isPremium: boolean;
  fitnessGoal: string;
  experienceLevel: string;
  activityLevel: string;
  preferredWorkout: string;
  weight: number;
  height: number;
  waterIntakeTarget: number;
  subscriptionStartDate: string;
  subscriptionEndDate: string;
  backupTrainerStatus: string;
  skillsToGain: string[];
  backupTrainer: {
    id: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
    specialization: string[];
  };
  fcmToken?: string;
  role?: string;
  status?: string;
  healthConditions?: string[];
  selectionMode?: string;
  matchedTrainers?: string[];
  selectStatus?: string;
  isOnline?: boolean;
  createdAt?: string;
  updatedAt?: string;
  membershipPlanId?: string;
  selectedTrainerId?: string;
  dietPreference?: string;
  waterIntake?: number;
  backupTrainerId?: string;
  sleepFrom?: string;
  wakeUpAt?: string;
}

interface BackUpClientsDashboardProps {
  clients: BackupClient[];
}

const BackUpClientsDashboard: React.FC<BackUpClientsDashboardProps> = ({ clients }) => {
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  const getGoalColor = (goal: string) => {
    const colors = {
      weightLoss: 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border-red-200',
      muscleGain: 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-200',
      endurance: 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200',
      flexibility: 'bg-gradient-to-r from-purple-100 to-violet-100 text-purple-800 border-purple-200',
      general: 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-200'
    };
    return colors[goal as keyof typeof colors] || colors.general;
  };

  const getExperienceColor = (level: string) => {
    const colors = {
      beginner: 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 border-yellow-200',
      intermediate: 'bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 border-orange-200',
      advanced: 'bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-red-200'
    };
    return colors[level as keyof typeof colors] || colors.beginner;
  };

  const getActivityColor = (level: string) => {
    const colors = {
      low: 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-200',
      moderate: 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border-blue-200',
      high: 'bg-gradient-to-r from-green-100 to-teal-100 text-green-800 border-green-200'
    };
    return colors[level as keyof typeof colors] || colors.moderate;
  };

  return (
    <div className="p-3 md:p-6 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Mobile Grid Layout */}
        <div className="block xl:hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {clients.map((client) => (
              <Card key={client.id} className="group shadow-xl hover:shadow-2xl transition-all duration-500 border-0 bg-white/95 backdrop-blur-sm overflow-hidden transform hover:-translate-y-2 hover:scale-105">
                <CardHeader className="pb-4 bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-500 relative overflow-hidden">
                  <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <Avatar className="h-14 w-14 ring-4 ring-white/50 shadow-lg">
                            <AvatarImage src={client.profileImage} />
                            <AvatarFallback className="bg-white text-purple-600 font-bold text-lg">
                              {getInitials(client.firstName, client.lastName)}
                            </AvatarFallback>
                          </Avatar>
                          {client.isPremium && (
                            <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-1 shadow-lg">
                              <Star className="h-3 w-3 text-yellow-900" />
                            </div>
                          )}
                        </div>
                        <div>
                          <CardTitle className="text-white text-xl font-bold">
                            {client.firstName} {client.lastName}
                          </CardTitle>
                          {client.isPremium && (
                            <Badge className="bg-yellow-400/90 text-yellow-900 text-xs mt-1 font-semibold border-0">
                              <Award className="h-3 w-3 mr-1" />
                              Premium
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-5 p-6">
                  {/* Contact Info with Enhanced Icons */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 text-sm group/item hover:bg-purple-50 p-2 rounded-lg transition-colors">
                      <div className="p-2 bg-purple-100 rounded-full">
                        <Mail className="h-4 w-4 text-purple-600" />
                      </div>
                      <span className="text-gray-700 font-medium">{client.email}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm group/item hover:bg-pink-50 p-2 rounded-lg transition-colors">
                      <div className="p-2 bg-pink-100 rounded-full">
                        <Phone className="h-4 w-4 text-pink-600" />
                      </div>
                      <span className="text-gray-700 font-medium">{client.phoneNumber}</span>
                    </div>
                  </div>

                  {/* Enhanced Physical Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 hover:shadow-md transition-shadow">
                      <div className="text-xl font-bold text-indigo-700">{client.weight}</div>
                      <div className="text-xs text-indigo-600 font-medium">KG</div>
                    </div>
                    <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100 hover:shadow-md transition-shadow">
                      <div className="text-xl font-bold text-purple-700">{client.height}</div>
                      <div className="text-xs text-purple-600 font-medium">CM</div>
                    </div>
                  </div>

                  {/* Enhanced Goals & Experience */}
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <Badge className={`text-xs font-semibold border ${getGoalColor(client.fitnessGoal)}`}>
                        <Target className="h-3 w-3 mr-1" />
                        {client.fitnessGoal}
                      </Badge>
                      <Badge className={`text-xs font-semibold border ${getExperienceColor(client.experienceLevel)}`}>
                        <Zap className="h-3 w-3 mr-1" />
                        {client.experienceLevel}
                      </Badge>
                      <Badge className={`text-xs font-semibold border ${getActivityColor(client.activityLevel)}`}>
                        <Activity className="h-3 w-3 mr-1" />
                        {client.activityLevel}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                      <strong>Preferred:</strong> {client.preferredWorkout}
                    </div>
                  </div>

                  {/* Enhanced Backup Trainer Section */}
                  <div className="p-4 bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 rounded-xl border-2 border-purple-100/50 shadow-inner">
                    <div className="flex items-center space-x-3 mb-3">
                      <Avatar className="h-10 w-10 ring-3 ring-purple-200 shadow-md">
                        <AvatarImage src={client.backupTrainer.profileImage} />
                        <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-sm">
                          {getInitials(client.backupTrainer.firstName, client.backupTrainer.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 text-sm">
                          {client.backupTrainer.firstName} {client.backupTrainer.lastName}
                        </p>
                        <p className="text-xs text-purple-600 font-medium">Backup Trainer</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {client.backupTrainer.specialization.slice(0, 4).map((spec, index) => (
                        <Badge key={index} className="text-xs bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border border-purple-200 font-medium">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Enhanced Subscription Info */}
                  <div className="flex items-center justify-between text-xs text-gray-600 pt-3 border-t border-gray-100">
                    <div className="flex items-center space-x-2">
                      <div className="p-1 bg-green-100 rounded-full">
                        <Calendar className="h-3 w-3 text-green-600" />
                      </div>
                      <span className="font-medium">Until {formatDate(client.subscriptionEndDate)}</span>
                    </div>
                    <Badge className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 text-xs font-semibold border border-green-200">
                      {client.backupTrainerStatus}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Enhanced Desktop Table Layout - Fixed Width, No Scrolling */}
        <div className="hidden xl:block">
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border-0 overflow-hidden">
            <table className="w-full table-fixed">
              <thead className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600">
                <tr>
                  <th className="w-1/6 px-4 py-6 text-left text-sm font-bold text-white">Client</th>
                  <th className="w-1/6 px-4 py-6 text-left text-sm font-bold text-white">Contact</th>
                  <th className="w-1/8 px-4 py-6 text-left text-sm font-bold text-white">Stats</th>
                  <th className="w-1/6 px-4 py-6 text-left text-sm font-bold text-white">Fitness Profile</th>
                  <th className="w-1/6 px-4 py-6 text-left text-sm font-bold text-white">Backup Trainer</th>
                  <th className="w-1/8 px-4 py-6 text-left text-sm font-bold text-white">Subscription</th>
                  <th className="w-1/12 px-4 py-6 text-left text-sm font-bold text-white">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {clients.map((client) => (
                  <tr 
                    key={client.id} 
                    className="hover:bg-gradient-to-r hover:from-purple-50 hover:via-pink-50 hover:to-indigo-50 transition-all duration-300 group border-b border-gray-50"
                  >
                    {/* Enhanced Client Cell */}
                    <td className="px-4 py-6">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <Avatar className="h-10 w-10 ring-3 ring-purple-100 group-hover:ring-purple-200 transition-all shadow-lg">
                            <AvatarImage src={client.profileImage} />
                            <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-sm">
                              {getInitials(client.firstName, client.lastName)}
                            </AvatarFallback>
                          </Avatar>
                          {client.isPremium && (
                            <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-1 shadow-lg">
                              <Star className="h-2 w-2 text-yellow-900" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-gray-900 text-sm truncate">
                            {client.firstName} {client.lastName}
                          </p>
                          {client.isPremium && (
                            <Badge className="bg-gradient-to-r from-yellow-400 to-amber-400 text-yellow-900 text-xs mt-1 font-semibold border-0">
                              Premium
                            </Badge>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Enhanced Contact Cell */}
                    <td className="px-4 py-6">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 text-xs">
                          <Mail className="h-3 w-3 text-purple-600" />
                          <span className="text-gray-700 font-medium truncate">{client.email}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs">
                          <Phone className="h-3 w-3 text-pink-600" />
                          <span className="text-gray-700 font-medium">{client.phoneNumber}</span>
                        </div>
                      </div>
                    </td>

                    {/* Enhanced Physical Stats */}
                    <td className="px-4 py-6">
                      <div className="flex space-x-2">
                        <div className="text-center p-1 bg-gradient-to-br from-indigo-50 to-purple-50 rounded border border-indigo-100">
                          <div className="text-xs font-bold text-indigo-700">{client.weight}kg</div>
                        </div>
                        <div className="text-center p-1 bg-gradient-to-br from-purple-50 to-pink-50 rounded border border-purple-100">
                          <div className="text-xs font-bold text-purple-700">{client.height}cm</div>
                        </div>
                      </div>
                    </td>

                    {/* Enhanced Fitness Profile */}
                    <td className="px-4 py-6">
                      <div className="space-y-1">
                        <div className="flex flex-wrap gap-1">
                          <Badge className={`text-xs font-semibold border ${getGoalColor(client.fitnessGoal)}`}>
                            {client.fitnessGoal}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          <Badge className={`text-xs font-semibold border ${getExperienceColor(client.experienceLevel)}`}>
                            {client.experienceLevel}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 bg-gray-50 px-1 py-0.5 rounded font-medium truncate">{client.preferredWorkout}</p>
                      </div>
                    </td>

                    {/* Enhanced Backup Trainer */}
                    <td className="px-4 py-6">
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8 ring-2 ring-pink-100 group-hover:ring-pink-200 transition-all shadow-md">
                          <AvatarImage src={client.backupTrainer.profileImage} />
                          <AvatarFallback className="bg-gradient-to-r from-pink-500 to-indigo-500 text-white font-bold text-xs">
                            {getInitials(client.backupTrainer.firstName, client.backupTrainer.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-gray-900 text-xs truncate">
                            {client.backupTrainer.firstName} {client.backupTrainer.lastName}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {client.backupTrainer.specialization.slice(0, 2).map((spec, index) => (
                              <Badge key={index} className="text-xs bg-gradient-to-r from-pink-100 to-indigo-100 text-pink-700 border border-pink-200 font-medium">
                                {spec}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Enhanced Subscription */}
                    <td className="px-4 py-6">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-1 text-xs text-gray-600">
                          <Calendar className="h-2 w-2 text-green-600" />
                          <span className="font-medium truncate">{formatDate(client.subscriptionEndDate)}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <Clock className="h-2 w-2 text-blue-600" />
                          <span className="font-medium truncate">{formatDate(client.subscriptionStartDate)}</span>
                        </div>
                      </div>
                    </td>

                    {/* Enhanced Status */}
                    <td className="px-4 py-6">
                      <Badge className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 text-xs font-semibold border border-green-200 shadow-sm">
                        {client.backupTrainerStatus}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {clients.length === 0 && (
          <div className="text-center py-16">
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-12 max-w-md mx-auto">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <User className="h-10 w-10 text-purple-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No backup clients found</h3>
              <p className="text-gray-600">There are no backup clients to display at the moment.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BackUpClientsDashboard;