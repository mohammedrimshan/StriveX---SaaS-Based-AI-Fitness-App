import { model } from "mongoose";
import { IPaymentEntity } from "@/entities/models/payment.entity";
import { paymentSchema } from "../schemas/payment.schema";

export const PaymentModel = model<IPaymentEntity>("Payment", paymentSchema);