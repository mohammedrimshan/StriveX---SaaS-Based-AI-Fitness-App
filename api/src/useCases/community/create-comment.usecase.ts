import { injectable, inject } from "tsyringe";
import { ICommentRepository } from "@/entities/repositoryInterfaces/community/comment-repository.interface";
import { IPostRepository } from "@/entities/repositoryInterfaces/community/post-repository.interface";
import { ICommentEntity } from "@/entities/models/comment.entity";
import { ICreateCommentUseCase } from "@/entities/useCaseInterfaces/community/create-comment-usecase.interface";
import { NotificationService } from "@/interfaceAdapters/services/notification.service";
import { IClientRepository } from "@/entities/repositoryInterfaces/client/client-repository.interface";
import { ITrainerRepository } from "@/entities/repositoryInterfaces/trainer/trainer-repository.interface";

@injectable()
export class CreateCommentUseCase implements ICreateCommentUseCase {
  constructor(
    @inject("ICommentRepository") private commentRepository: ICommentRepository,
    @inject("IPostRepository") private postRepository: IPostRepository,
    @inject("IClientRepository") private clientRepository: IClientRepository,
    @inject("ITrainerRepository") private trainerRepository: ITrainerRepository,
    @inject("NotificationService") private notificationService: NotificationService
  ) {}

  async execute(data: Partial<ICommentEntity>, userId: string): Promise<ICommentEntity> {
    const post = await this.postRepository.findById(data.postId!);
    if (!post) throw new Error("Post not found");

    const commentData: Partial<ICommentEntity> = {
      ...data,
      authorId: userId,
      likes: [],
      isDeleted: false,
      reports: [],
    };

    const savedComment = await this.commentRepository.save(commentData);

    if (post.authorId !== userId) {
      try {
        // Fetch commenter name
        let senderName = "Someone";

        const client = await this.clientRepository.findByClientNewId(userId);
        if (client) {
          senderName = `${client.firstName} ${client.lastName}`;
        } else {
          const trainer = await this.trainerRepository.findById(userId);
          if (trainer) {
            senderName = `${trainer.firstName} ${trainer.lastName}`;
          }
        }

        await this.notificationService.sendToUser(
          post.authorId,
          "New Comment",
          `${senderName} commented on your post!`,
          "INFO"
        );
      } catch (error) {
        console.error("Error sending notification:", error);
      }
    }

    return savedComment;
  }
}
