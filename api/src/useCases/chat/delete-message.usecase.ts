import { inject, injectable } from "tsyringe";
import { IDeleteMessageUseCase } from "@/entities/useCaseInterfaces/chat/delete-message-usecase.interface";
import { IMessageRepository } from "@/entities/repositoryInterfaces/chat/message-repository.interface";
import { CustomError } from "@/entities/utils/custom.error";
import { ERROR_MESSAGES, HTTP_STATUS } from "@/shared/constants";

@injectable()
export class DeleteMessageUseCase implements IDeleteMessageUseCase {
  constructor(
    @inject("IMessageRepository") private _messageRepository: IMessageRepository
  ) {}

  async execute(messageId: string, userId: string): Promise<void> {
    if (!messageId || !userId) {
      throw new CustomError(ERROR_MESSAGES.ID_NOT_PROVIDED, HTTP_STATUS.BAD_REQUEST);
    }

    const message = await this._messageRepository.findById(messageId);
    console.log(message, "MESSAGE TO DELETE");
    if (!message) {
      throw new CustomError("Message not found", HTTP_STATUS.NOT_FOUND);
    }

    if (message.senderId !== userId) {
      throw new CustomError("Unauthorized to delete this message", HTTP_STATUS.FORBIDDEN);
    }

    const deleted = await this._messageRepository.delete(messageId);
    if (!deleted) {
      throw new CustomError("Failed to delete message", HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }
  }
}