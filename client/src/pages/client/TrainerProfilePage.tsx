import { useFetchTrainerProfile } from "@/hooks/client/useFetchTrainerProfile";
import { TrainerProfile } from "@/pages/client/TrainerProfile/TrainerProfile";
import { useParams } from "react-router-dom";

const Index = () => {
  const { trainerId } = useParams<{ trainerId: string }>();
  const { data: trainer, isLoading, error } = useFetchTrainerProfile(trainerId);

  console.log("Trainer ID:", trainerId);
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