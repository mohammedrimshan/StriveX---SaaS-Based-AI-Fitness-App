
import { Navigate } from 'react-router-dom';
import TrainerDashboard from './TrainerDashboard';
import { RootState } from '@/store/store';
import { useSelector } from 'react-redux';
const DashboardTrainer: React.FC = () => {
  const user = useSelector((state: RootState) => state.trainer.trainer);
  const trainerId = user?.id; 
  if (!trainerId) {
    return <Navigate to="/login" replace />;
  }

  return <TrainerDashboard trainerId={trainerId} />;
};

export default DashboardTrainer;