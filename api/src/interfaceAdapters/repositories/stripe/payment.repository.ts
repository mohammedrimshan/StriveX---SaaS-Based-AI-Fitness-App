import { injectable } from "tsyringe";
import { IPaymentEntity } from "@/entities/models/payment.entity";
import { IPaymentRepository } from "@/entities/repositoryInterfaces/Stripe/payment-repository.interface";
import { PaymentModel } from "@/frameworks/database/mongoDB/models/payment.model";
import { BaseRepository } from "../base.repository";

@injectable()
export class PaymentRepository extends BaseRepository<IPaymentEntity> implements IPaymentRepository {
  constructor() {
    super(PaymentModel);
  }

  async findByStripePaymentId(stripePaymentId: string): Promise<IPaymentEntity | null> {
    try {
      const payment = await this.model.findOne({ stripePaymentId }).lean();
      if (!payment) {
        console.log(`No payment found for stripePaymentId: ${stripePaymentId}`);
        return null;
      }
      return this.mapToEntity(payment);
    } catch (error) {
      console.error(`Error finding payment by stripePaymentId ${stripePaymentId}:`, error);
      throw error;
    }
  }

  async findByStripeSessionId(stripeSessionId: string): Promise<IPaymentEntity | null> {
    try {
      const payment = await this.model.findOne({ stripeSessionId }).lean();
      if (!payment) {
        console.log(`No payment found for stripeSessionId: ${stripeSessionId}`);
        return null;
      }
      return this.mapToEntity(payment);
    } catch (error) {
      console.error(`Error finding payment by stripeSessionId ${stripeSessionId}:`, error);
      throw error;
    }
  }

  async updatePaymentStatus(
    stripePaymentId: string,
    status: string,
    clientId?: string // Changed from userId to clientId
  ): Promise<IPaymentEntity> {
    try {
      const updateData: any = { status };
      if (clientId) updateData.clientId = clientId;

      const payment = await this.model
        .findOneAndUpdate(
          { stripePaymentId },
          { $set: updateData },
          { new: true, lean: true }
        )
        .exec();

      if (!payment) {
        console.error(`Payment not found for stripePaymentId: ${stripePaymentId}`);
        throw new Error("Payment not found");
      }

      return this.mapToEntity(payment);
    } catch (error) {
      console.error(`Error updating payment status for stripePaymentId ${stripePaymentId}:`, error);
      throw error;
    }
  }
}