import { SlotResponseDTO } from "@/shared/dto/user.dto";

export interface IGetBookedTrainerSlotsUseCase {
  execute(trainerId: string): Promise<SlotResponseDTO[]>;
}