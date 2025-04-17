import { injectable } from "tsyringe";
import { IPaymentEntity } from "@/entities/models/payment.entity";
import { IPaymentRepository } from "@/entities/repositoryInterfaces/Stripe/payment-repository.interface";
import { PaymentModel } from "@/frameworks/database/mongoDB/models/payment.model";
import { BaseRepository } from "../base.repository";

@injectable()
export class PaymentRepository
  extends BaseRepository<IPaymentEntity>
  implements IPaymentRepository
{
  constructor() {
    super(PaymentModel);
  }

  async findByStripePaymentId(stripePaymentId: string): Promise<IPaymentEntity | null> {
    const payment = await this.model.findOne({ stripePaymentId }).lean();
    if (!payment) return null;
    return this.mapToEntity(payment);
  }

  async updatePaymentStatus(
    stripePaymentId: string,
    status: string,
    userId?: string
  ): Promise<IPaymentEntity> {
    const updateData: any = { status };
    if (userId) updateData.userId = userId;
  
    const payment = await this.model
      .findOneAndUpdate(
        { stripePaymentId },
        { $set: updateData },
        { new: true, lean: true }
      )
      .exec();
  
    if (!payment) {
      throw new Error("Payment not found");
    }
  
    return this.mapToEntity(payment);
  }
}