import { ISlotEntity } from "@/entities/models/slot.entity";

export interface IEndVideoCallUseCase {
  execute(slotId: string, userId: string, role: "trainer" | "client"): Promise<ISlotEntity>;
}