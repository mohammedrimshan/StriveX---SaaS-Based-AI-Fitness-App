import { useFetchTrainerProfile } from "@/hooks/client/useFetchTrainerProfile";
import TrainerProfile from "./TrainerProfile/TrainerProfile";
import { useParams } from "react-router-dom";
import { RootState } from "@/store/store";
import { useSelector } from "react-redux";


const Index = () => {
  const { trainerId } = useParams<{ trainerId: string }>();
    const client = useSelector((state: RootState) => state.client.client);
  const clientId = client?.id; // Assume user has clientId

  const { data: trainer, isLoading, error } = useFetchTrainerProfile(trainerId, clientId);

  console.log("Trainer ID:", trainerId);
  console.log("Client ID:", clientId);
  console.log("Trainer Data:", trainer);
  console.log("Loading:", isLoading);
  console.log("Error:", error);

  return (
    <TrainerProfile
      trainer={trainer || null}
      loading={isLoading}
      error={error ? (error instanceof Error ? error.message : "An error occurred") : null}
    />
  );
};

export default Index;
