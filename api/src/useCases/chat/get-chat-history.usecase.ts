import { inject, injectable } from "tsyringe";
import { IGetChatHistoryUseCase } from "@/entities/useCaseInterfaces/chat/get-chat-history-usecase.interface";
import { IMessageRepository } from "@/entities/repositoryInterfaces/chat/message-repository.interface";
import { IMessageEntity } from "@/entities/models/message.entity";
import { CustomError } from "@/entities/utils/custom.error";
import { ERROR_MESSAGES, HTTP_STATUS } from "@/shared/constants";

@injectable()
export class GetChatHistoryUseCase implements IGetChatHistoryUseCase {
  constructor(
    @inject("IMessageRepository") private _messageRepository: IMessageRepository
  ) {}

  async execute(
    user1Id: string,
    user2Id: string,
    page: number,
    limit: number
  ): Promise<{ items: IMessageEntity[]; total: number }> {
    console.log(
      `[GetChatHistoryUseCase] Fetching chat history for user1Id: ${user1Id}, user2Id: ${user2Id}, page: ${page}, limit: ${limit}`
    );

    if (!user1Id || !user2Id) {
      console.error(`[GetChatHistoryUseCase] Missing user1Id or user2Id`);
      throw new CustomError(ERROR_MESSAGES.ID_NOT_PROVIDED, HTTP_STATUS.BAD_REQUEST);
    }

    if (page < 1 || limit < 1) {
      console.error(`[GetChatHistoryUseCase] Invalid page: ${page} or limit: ${limit}`);
      throw new CustomError("Invalid page or limit parameters", HTTP_STATUS.BAD_REQUEST);
    }

    const skip = (page - 1) * limit;
    console.log(`[GetChatHistoryUseCase] Calculated skip: ${skip}`);

    const result = await this._messageRepository.getConversation(user1Id, user2Id, skip, limit);
    console.log(`[GetChatHistoryUseCase] Chat history result: ${JSON.stringify(result, null, 2)}`);

    if (result.total === 0) {
      console.warn(
        `[GetChatHistoryUseCase] No messages found for user1Id: ${user1Id}, user2Id: ${user2Id}. Check messages collection with IDs: ${user1Id}, ${user2Id}.`
      );
    }

    return result;
  }
}