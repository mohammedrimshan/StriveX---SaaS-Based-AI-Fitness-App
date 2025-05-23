import { Schema } from "mongoose";
import { IPaymentEntity } from "@/entities/models/payment.entity";
import { PaymentStatus } from "@/shared/constants";

export const paymentSchema = new Schema<IPaymentEntity>(
  {
    clientId: { type: String, required: true }, // Changed from userId to clientId
    trainerId: { type: String, required: false },
    membershipPlanId: { type: String, required: true },
    amount: { type: Number, required: true },
    stripePaymentId: { type: String, required: false },
    stripeSessionId: { type: String, required: true },
    trainerAmount: { type: Number, required: false, default: 0 }, // Added for trainer's 80%
    adminAmount: { type: Number, required: true }, // 20% for admin
    status: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
    },
  },
  { timestamps: true }
);

paymentSchema.index({ stripePaymentId: 1 }, { unique: true, sparse: true });
paymentSchema.index({ stripeSessionId: 1 }, { unique: true });