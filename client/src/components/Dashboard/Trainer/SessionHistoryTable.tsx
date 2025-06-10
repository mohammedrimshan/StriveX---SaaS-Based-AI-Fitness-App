import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Download, History, Calendar, Clock, User } from 'lucide-react';
import { useSessionHistory } from '@/hooks/trainer/useTrainerDashboard';

interface SessionHistoryTableProps {
  trainerId: string;
}

const SessionHistoryTable: React.FC<SessionHistoryTableProps> = ({ trainerId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: sessions, isLoading, error } = useSessionHistory(trainerId, {
    status: statusFilter === 'all' ? undefined : statusFilter,
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0 text-xs font-medium px-3 py-1 shadow-sm">
            Completed
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge className="bg-gradient-to-r from-amber-500 to-amber-600 text-white border-0 text-xs font-medium px-3 py-1 shadow-sm">
            Cancelled
          </Badge>
        );
      case 'no-show':
        return (
          <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0 text-xs font-medium px-3 py-1 shadow-sm">
            No Show
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gradient-to-r from-slate-500 to-slate-600 text-white border-0 text-xs font-medium px-3 py-1 shadow-sm">
            {status}
          </Badge>
        );
    }
  };

  const filteredSessions = sessions?.filter(session => 
    session.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (session.workoutType?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-slate-600">Loading session history...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-600">
        <div className="text-center">
          <div className="text-lg font-medium">Error loading session history</div>
          <div className="text-sm text-slate-600 mt-1">{error.message}</div>
        </div>
      </div>
    );
  }

  return (
    <Card className="bg-white border-0 shadow-lg rounded-xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-100 pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 rounded-lg">
              <History className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Session History</h2>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-blue-600">{filteredSessions.length}</div>
            <div className="text-xs text-slate-500">Sessions</div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {/* Enhanced Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-9 border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40 h-9 border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <div className="flex items-center gap-2">
                <Filter className="w-3 h-3 text-slate-500" />
                <SelectValue placeholder="Status" />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-lg border-slate-200">
              <SelectItem value="all" className="rounded-md">All Status</SelectItem>
              <SelectItem value="completed" className="rounded-md">Completed</SelectItem>
              <SelectItem value="cancelled" className="rounded-md">Cancelled</SelectItem>
              <SelectItem value="no-show" className="rounded-md">No Show</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            className="w-full sm:w-auto h-9 px-4 border-slate-200 text-slate-700 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all duration-200 rounded-lg"
          >
            <Download className="w-3 h-3 mr-2" />
            Export
          </Button>
        </div>

        {/* Custom Table with Card Layout */}
        <div className="space-y-3">
          {/* Table Header */}
          <div className="hidden md:grid grid-cols-4 gap-4 p-3 bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg border border-slate-200">
            <div className="flex items-center gap-2 font-semibold text-slate-700 text-sm">
              <Calendar className="w-3 h-3 text-slate-500" />
              Date
            </div>
            <div className="flex items-center gap-2 font-semibold text-slate-700 text-sm">
              <Clock className="w-3 h-3 text-slate-500" />
              Time
            </div>
            <div className="flex items-center gap-2 font-semibold text-slate-700 text-sm">
              <User className="w-3 h-3 text-slate-500" />
              Client
            </div>
            <div className="font-semibold text-slate-700 text-sm">Status</div>
          </div>

          {/* Table Rows */}
          {filteredSessions.map((session, index) => (
            <div 
              key={session.id} 
              className="group p-3 bg-white border border-slate-200 rounded-lg hover:shadow-md hover:border-blue-200 transition-all duration-200 hover:bg-blue-50/30"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {/* Mobile Layout */}
              <div className="md:hidden space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center">
                      <User className="w-3 h-3 text-purple-600" />
                    </div>
                    <div className="font-semibold text-slate-900 text-sm">{session.clientName}</div>
                  </div>
                  {getStatusBadge(session.status)}
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-slate-600">
                    <Calendar className="w-3 h-3" />
                    {session.date}
                  </div>
                  <div className="flex items-center gap-1 text-slate-600">
                    <Clock className="w-3 h-3" />
                    {session.startTime}
                  </div>
                </div>
              </div>

              {/* Desktop Layout */}
              <div className="hidden md:grid grid-cols-4 gap-4 items-center">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                    <Calendar className="w-3 h-3 text-blue-600" />
                  </div>
                  <div className="font-medium text-slate-900 text-sm">{session.date}</div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center">
                    <Clock className="w-3 h-3 text-green-600" />
                  </div>
                  <div className="font-medium text-slate-900 text-sm">{session.startTime}</div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center">
                    <User className="w-3 h-3 text-purple-600" />
                  </div>
                  <div className="font-semibold text-slate-900 text-sm">{session.clientName}</div>
                </div>
                
                <div className="flex items-center">
                  {getStatusBadge(session.status)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredSessions.length === 0 && (
          <div className="text-center py-12">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Search className="w-6 h-6 text-slate-400" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 mb-1">No sessions found</h3>
            <p className="text-sm text-slate-500">Try adjusting your search criteria or status filter.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SessionHistoryTable;