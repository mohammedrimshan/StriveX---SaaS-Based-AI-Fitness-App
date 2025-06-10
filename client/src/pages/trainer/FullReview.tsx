
import TrainerReviews from './GetReviews'
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

function FullReview() {
  const user = useSelector((state: RootState) => state.trainer.trainer);
  const trainerId = user?.id;

  if (!trainerId) return null; 

  return <TrainerReviews trainerId={trainerId} />;
}

export default FullReview
