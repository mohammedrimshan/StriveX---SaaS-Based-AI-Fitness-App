import { injectable, inject } from "tsyringe";
import { ICommentRepository } from "@/entities/repositoryInterfaces/community/comment-repository.interface";
import { IGetCommentsUseCase } from "@/entities/useCaseInterfaces/community/get-comments-usecase.interface";
import { ICommentEntity } from "@/entities/models/comment.entity";
import { CustomError } from "@/entities/utils/custom.error";
import { ERROR_MESSAGES, HTTP_STATUS } from "@/shared/constants";

@injectable()
export class GetCommentsUseCase implements IGetCommentsUseCase {
  constructor(
    @inject("ICommentRepository") private commentRepository: ICommentRepository
  ) {}

  async execute(postId: string, page: number, limit: number): Promise<{ items: ICommentEntity[]; total: number }> {
    if (page < 1 || limit < 1) {
      throw new CustomError("Invalid pagination parameters", HTTP_STATUS.BAD_REQUEST);
    }

    const skip = (page - 1) * limit;
    
    const result = await this.commentRepository.findByPostId(postId, skip, limit);

    return result;
  }
}