import { inject, injectable } from "tsyringe";
import { ISlotRepository } from "../../entities/repositoryInterfaces/slot/slot-repository.interface";
import { ISlotEntity } from "../../entities/models/slot.entity";
import { HTTP_STATUS, ERROR_MESSAGES, SlotStatus } from "../../shared/constants";
import { CustomError } from "../../entities/utils/custom.error";
import slotExpiryQueue from "../../frameworks/queue/bull/slot-expiry.setup";
import { RuleBasedSlotInput, Weekday } from "@/entities/models/rulebasedslot.entity";
import { ICreateSlotsFromRuleUseCase } from "@/entities/useCaseInterfaces/slot/create-slots-from-rule.usecase.interface";

@injectable()
export class CreateSlotsFromRuleUseCase implements ICreateSlotsFromRuleUseCase{
  constructor(
    @inject("ISlotRepository") private slotRepository: ISlotRepository
  ) {}

  async execute(input: RuleBasedSlotInput): Promise<ISlotEntity[]> {
    const {
      trainerId,
      rules,
      fromDate,
      toDate,
      slotDurationInMinutes = 30
    } = input;

    const startDate = new Date(fromDate);
    const endDate = new Date(toDate);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || startDate > endDate) {
      throw new CustomError(ERROR_MESSAGES.INVALID_DATE_FORMAT, HTTP_STATUS.BAD_REQUEST);
    }

    const allSlots: ISlotEntity[] = [];

    for (
      let current = new Date(startDate);
      current <= endDate;
      current.setDate(current.getDate() + 1)
    ) {
      const weekday = current.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase() as Weekday;
      const rule = rules[weekday];

      if (!rule) continue;

      const [startH, startM] = rule.start.split(":").map(Number);
      const [endH, endM] = rule.end.split(":").map(Number);

      const dayStart = new Date(current);
      dayStart.setHours(startH, startM, 0, 0);

      const dayEnd = new Date(current);
      dayEnd.setHours(endH, endM, 0, 0);

      while (dayStart < dayEnd) {
        const slotStart = new Date(dayStart);
        const slotEnd = new Date(dayStart);
        slotEnd.setMinutes(slotEnd.getMinutes() + slotDurationInMinutes);

        if (slotEnd > dayEnd) break;

        // Check for overlap
        const overlaps = await this.slotRepository.findOverlappingSlots(
          trainerId,
          slotStart,
          slotEnd
        );

        if (overlaps.length === 0) {
          const formattedDate = current.toISOString().split("T")[0];
          const formattedStart = slotStart.toTimeString().substring(0, 5);
          const formattedEnd = slotEnd.toTimeString().substring(0, 5);

          const newSlot: Partial<ISlotEntity> = {
            trainerId,
            date: formattedDate,
            startTime: formattedStart,
            endTime: formattedEnd,
            status: SlotStatus.AVAILABLE,
            isBooked: false,
            isAvailable: true,
            expiresAt: new Date(slotEnd),
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          const savedSlot = await this.slotRepository.save(newSlot);
          allSlots.push(savedSlot as ISlotEntity);

          // Schedule expiry
          const delay = slotEnd.getTime() - Date.now();
          if (delay > 0) {
            await slotExpiryQueue.add({ slotId: savedSlot.id }, { delay });
          }
        }

        dayStart.setMinutes(dayStart.getMinutes() + slotDurationInMinutes);
      }
    }

    return allSlots;
  }
}
