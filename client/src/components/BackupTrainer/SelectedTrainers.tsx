import TrainerCards from "./Client/TrainersCard"
import { useClientTrainersInfo } from "@/hooks/client/useClientTrainersInfo"

const SelectedTrainers = () => {
  const { data, isLoading, isError } = useClientTrainersInfo()

  if (isLoading) {
    return (
      <div className="py-8 px-4 text-center">
        <div className="text-gray-600">Loading trainer information...</div>
      </div>
    )
  }

  if (isError || !data || (!data.selectedTrainer && !data.backupTrainer)) {
    return (
      <div className="py-8 px-4 text-center">
        <div className="text-red-600">Failed to load trainer information.</div>
      </div>
    )
  }

  return <TrainerCards data={{
    selectedTrainer: data.selectedTrainer || {
      id: "",
      firstName: "Not Assigned",
      lastName: "",
      specialization: [],
      profileImage: "/placeholder.svg",
      phoneNumber: "N/A",
      email: "N/A",
      experience: 0,
      gender: "N/A"
    },
    backupTrainer: data.backupTrainer || {
      id: "",
      firstName: "Not Assigned",
      lastName: "",
      specialization: [],
      profileImage: "/placeholder.svg",
      phoneNumber: "N/A",
      email: "N/A",
      experience: 0,
      gender: "N/A"
    }
  }} />
}

export default SelectedTrainers