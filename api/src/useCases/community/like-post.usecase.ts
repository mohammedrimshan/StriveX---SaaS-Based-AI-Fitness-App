import { injectable, inject } from 'tsyringe';
import { IPostRepository } from '@/entities/repositoryInterfaces/community/post-repository.interface';
import { IPostEntity } from '@/entities/models/post.entity';
import { ILikePostUseCase } from '@/entities/useCaseInterfaces/community/like-post-usecase.interface';
import { IClientRepository } from '@/entities/repositoryInterfaces/client/client-repository.interface';
import { ITrainerRepository } from '@/entities/repositoryInterfaces/trainer/trainer-repository.interface';
import { NotificationService } from '@/interfaceAdapters/services/notification.service';
import mongoose from 'mongoose';

@injectable()
export class LikePostUseCase implements ILikePostUseCase {
  constructor(
    @inject('IPostRepository') private postRepository: IPostRepository,
    @inject('IClientRepository') private clientRepository: IClientRepository,
    @inject('ITrainerRepository') private trainerRepository: ITrainerRepository,
    @inject('NotificationService') private notificationService: NotificationService
  ) {}

  async execute(postId: string, userId: string): Promise<IPostEntity> {
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      throw new Error('Invalid post ID');
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error('Invalid user ID');
    }

    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new Error('Post not found');
    }
    if (post.isDeleted) {
      throw new Error('Cannot like a deleted post');
    }

    const hasLiked = post.likes.includes(userId);
    let updatedPost: IPostEntity | null;
    try {
      updatedPost = hasLiked
        ? await this.postRepository.removeLike(postId, userId)
        : await this.postRepository.addLike(postId, userId);
    } catch (error) {
      throw new Error('Failed to update like');
    }

    if (!updatedPost) {
      updatedPost = await this.postRepository.findById(postId);
      if (!updatedPost) {
        throw new Error('Failed to update like');
      }
    }

    if (!hasLiked && post.authorId !== userId) {
      let senderName = 'Someone';
      try {
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
          'Post Liked',
          `${senderName} liked your post!`,
          'INFO'
        );
      } catch (error) {
        // Silently catch notification errors to avoid blocking the like operation
      }
    }

    return updatedPost;
  }
}