import StatsCards from '@/components/Dashboard/Trainer/StatsCards';
import UpcomingSessions from '@/components/Dashboard/Trainer/UpcomingSessions';
import WeeklySessionStats from '@/components/Dashboard/Trainer/WeeklySessionStats';
import ClientFeedback from '@/components/Dashboard/Trainer/ClientFeedback';
import EarningsReport from '@/components/Dashboard/Trainer/EarningsReport';
import ClientProgressTracker from '@/components/Dashboard/Trainer/ClientProgressTracker';
import SessionHistoryTable from '@/components/Dashboard/Trainer/SessionHistoryTable';

interface TrainerDashboardProps {
  trainerId: string;
}

const TrainerDashboard: React.FC<TrainerDashboardProps> = ({ trainerId }) => {
  const year = new Date().getFullYear();
  const month = new Date().getMonth() + 1;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 lg:p-8 mt-14">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            Trainer Dashboard
          </h1>
          <p className="text-slate-600 text-lg">Welcome back! Here's your training overview for today.</p>
        </div>

        {/* Stats Cards */}
        <div className="animate-slide-in" style={{ animationDelay: '0.1s' }}>
          <StatsCards trainerId={trainerId} year={year} month={month} />
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="xl:col-span-2 space-y-8">
            <div className="animate-scale-in" style={{ animationDelay: '0.2s' }}>
              <UpcomingSessions trainerId={trainerId} />
            </div>
            
            <div className="animate-scale-in" style={{ animationDelay: '0.3s' }}>
              <WeeklySessionStats trainerId={trainerId} year={year} month={month} />
            </div>
            
            <div className="animate-scale-in" style={{ animationDelay: '0.4s' }}>
              <SessionHistoryTable trainerId={trainerId} />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            <div className="animate-scale-in" style={{ animationDelay: '0.5s' }}>
              <ClientFeedback trainerId={trainerId} />
            </div>
            
            <div className="animate-scale-in" style={{ animationDelay: '0.6s' }}>
              <EarningsReport trainerId={trainerId} year={year} month={month} />
            </div>
            
            <div className="animate-scale-in" style={{ animationDelay: '0.7s' }}>
              <ClientProgressTracker trainerId={trainerId} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainerDashboard;