import TrainerCards from "./Client/TrainersCard";
import { useClientTrainersInfo } from "@/hooks/client/useClientTrainersInfo";
import { useClientProfile } from "@/hooks/client/useClientProfile";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

const SelectedTrainers = () => {
  const client = useSelector((state: RootState) => state.client.client);
  const { data: clientProfile, isLoading: isProfileLoading, error: profileError } = useClientProfile(client?.id || null);
  const { data, isLoading, isError } = useClientTrainersInfo();

  if (isProfileLoading || isLoading) {
    return (
      <div className="py-8 px-4 text-center">
        <div className="text-gray-600">Loading trainer information...</div>
      </div>
    );
  }

  if (profileError || isError || !clientProfile || !data) {
    return (
      <div className="py-8 px-4 text-center">
        <div className="text-red-600">Failed to load client or trainer information.</div>
      </div>
    );
  }

  // Case: No trainers assigned (selectStatus is "pending" or no selectedTrainer)
  if (clientProfile.selectStatus === "pending" || !data.selectedTrainer) {
    return (
      <div className="py-8 px-4 text-center">
        <div className="text-gray-600">No trainers assigned yet. Please wait for trainer selection.</div>
      </div>
    );
  }

  return (
    <TrainerCards
      data={{
        selectedTrainer: data.selectedTrainer || {
          id: "",
          firstName: "Not Assigned",
          lastName: "",
          specialization: [],
          profileImage: "/placeholder.svg",
          phoneNumber: "N/A",
          email: "N/A",
          experience: 0,
          gender: "N/A",
        },
        backupTrainer:
          clientProfile.backupTrainerStatus === "PENDING" || !data.backupTrainer
            ? {
                id: "",
                firstName: "Not Assigned",
                lastName: "",
                specialization: [],
                profileImage: "/placeholder.svg",
                phoneNumber: "N/A",
                email: "N/A",
                experience: 0,
                gender: "N/A",
              }
            : data.backupTrainer,
      }}
      isPremium={clientProfile.isPremium}
      isBackupAssigned={clientProfile.backupTrainerStatus !== "PENDING" && !!data.backupTrainer}
    />
  );
};

export default SelectedTrainers;