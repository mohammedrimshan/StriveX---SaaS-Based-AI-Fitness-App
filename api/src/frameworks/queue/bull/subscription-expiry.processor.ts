import { injectable, inject } from "tsyringe";
import { IClientRepository } from "@/entities/repositoryInterfaces/client/client-repository.interface";
import { CronJob } from "cron";
import { TrainerSelectionStatus } from "@/shared/constants"; 

@injectable()
export class SubscriptionExpiryProcessor {
  constructor(
    @inject("IClientRepository") private clientRepository: IClientRepository
  ) {}

  start() {
    const job = new CronJob("0 0 * * *", async () => {
      try {
        console.log("Checking for expired subscriptions...");
        const { items: clients } = await this.clientRepository.find(
          { isPremium: true, subscriptionEndDate: { $lte: new Date() } },
          0,
          1000
        );

        for (const client of clients) {
          if (client && client.id) {
            const clientId = client.id.toString();
            await this.clientRepository.updateByClientId(clientId, {
              isPremium: false,
              subscriptionStartDate: undefined,
              subscriptionEndDate: undefined,
              selectedTrainerId: undefined,
              selectStatus: TrainerSelectionStatus.PENDING,
              matchedTrainers: [],
            });
            console.log(`Subscription expired for client: ${clientId}`);
          }
        }
      } catch (error) {
        console.error("Error in subscription expiry check:", error);
      }
    });

    job.start();
  }
}
