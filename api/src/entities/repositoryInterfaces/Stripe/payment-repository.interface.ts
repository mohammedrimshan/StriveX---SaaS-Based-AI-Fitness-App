import { IPaymentEntity } from "@/entities/models/payment.entity";
import { IBaseRepository } from "../base-repository.interface";

export interface IPaymentRepository extends IBaseRepository<IPaymentEntity> {
  findByStripePaymentId(stripePaymentId: string): Promise<IPaymentEntity | null>;
  updatePaymentStatus(
    stripePaymentId: string,
    status: string,
    userId?: string
  ): Promise<IPaymentEntity>;
}