import { injectable, inject } from "tsyringe";
import { IPostRepository } from "@/entities/repositoryInterfaces/community/post-repository.interface";
import { IPostEntity } from "@/entities/models/post.entity";
import { IClientRepository } from "@/entities/repositoryInterfaces/client/client-repository.interface";
import { ITrainerRepository } from "@/entities/repositoryInterfaces/trainer/trainer-repository.interface";
import { ICreatePostUseCase } from "@/entities/useCaseInterfaces/community/create-post-usecase.interface";
import { IClientEntity } from "@/entities/models/client.entity";
import { ITrainerEntity } from "@/entities/models/trainer.entity";
import { ICloudinaryService } from "@/interfaceAdapters/services/cloudinary.service";

@injectable()
export class CreatePostUseCase implements ICreatePostUseCase {
  constructor(
    @inject("IPostRepository") private postRepository: IPostRepository,
    @inject("IClientRepository") private clientRepository: IClientRepository,
    @inject("ITrainerRepository") private trainerRepository: ITrainerRepository,
    @inject("ICloudinaryService") private cloudinaryService : ICloudinaryService
  ) {}

  async execute(data: Partial<IPostEntity>, userId: string): Promise<IPostEntity> {
    const client = await this.clientRepository.findByClientNewId(userId);
    const trainer = await this.trainerRepository.findById(userId);

    console.log(`Client query result:`, client);
    console.log(`Trainer query result:`, trainer);

    const user: IClientEntity | ITrainerEntity | null = client || trainer;
    if (!user) throw new Error("User not found");

    let category: string | undefined;

    if (trainer) {
      category = trainer.specialization?.[0];
    } else if (client) {
      category = client.preferredWorkout;
    }

    if (!category) throw new Error("User category not specified");

    let mediaUrl:string | undefined;
    if(data.mediaUrl){
        const uploadResult = await this.cloudinaryService.uploadFile(data.mediaUrl,{
            folder:`community_post/${userId}`
        })
        mediaUrl = uploadResult.secure_url;
    }
    const role = trainer ? 'trainer' : 'client';
    const postData: Partial<IPostEntity> = {
      ...data,
      authorId: userId,
      role,
      category,
      mediaUrl,
      likes: [],
      isDeleted: false,
      reports: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return this.postRepository.save(postData);
  }
}
