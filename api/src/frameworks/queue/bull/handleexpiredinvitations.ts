// D:\StriveX\api\src\cron\handleExpiredInvitations.ts
import { container } from "tsyringe";
import { IHandleExpiredInvitationsUseCase } from "@/entities/useCaseInterfaces/backtrainer/handle-expired-invitations.usecaseinterface";
import { CronJob } from "cron";

const handleExpiredInvitations = async () => {
  const useCase = container.resolve<IHandleExpiredInvitationsUseCase>("IHandleExpiredInvitationsUseCase");
  await useCase.execute();
};

const job = new CronJob(
  "0 * * * *", 
  () => {
    handleExpiredInvitations().catch((err) => {
      console.error("Error running handleExpiredInvitations cron job:", err);
    });
  }
);

job.start();

export default handleExpiredInvitations;
