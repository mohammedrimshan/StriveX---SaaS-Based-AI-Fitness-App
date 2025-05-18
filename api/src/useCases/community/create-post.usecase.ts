import { injectable, inject } from "tsyringe";
import { IPostRepository } from "@/entities/repositoryInterfaces/community/post-repository.interface";
import { IPostEntity } from "@/entities/models/post.entity";
import { IClientRepository } from "@/entities/repositoryInterfaces/client/client-repository.interface";
import { ITrainerRepository } from "@/entities/repositoryInterfaces/trainer/trainer-repository.interface";
import { ICreatePostUseCase } from "@/entities/useCaseInterfaces/community/create-post-usecase.interface";
import { IClientEntity } from "@/entities/models/client.entity";
import { ITrainerEntity } from "@/entities/models/trainer.entity";
import { ICloudinaryService } from "@/interfaceAdapters/services/cloudinary.service";
import { v4 as uuidv4 } from "uuid";
import { WORKOUT_TYPES, WorkoutType } from "@/shared/constants";

@injectable()
export class CreatePostUseCase implements ICreatePostUseCase {
  constructor(
    @inject("IPostRepository") private postRepository: IPostRepository,
    @inject("IClientRepository") private clientRepository: IClientRepository,
    @inject("ITrainerRepository") private trainerRepository: ITrainerRepository,
    @inject("ICloudinaryService") private cloudinaryService: ICloudinaryService
  ) {}

  async execute(
    data: Partial<IPostEntity>,
    userId: string
  ): Promise<IPostEntity> {
    console.log("[DEBUG] Creating post via HTTP:", { data, userId });

    const client = await this.clientRepository.findByClientNewId(userId);
    const trainer = await this.trainerRepository.findById(userId);

    console.log(
      "[DEBUG] Client query result:",
      JSON.stringify(client, null, 2)
    );
    console.log(
      "[DEBUG] Trainer query result:",
      JSON.stringify(trainer, null, 2)
    );

    const user: IClientEntity | ITrainerEntity | null = client || trainer;
    if (!user) {
      console.error("[DEBUG] User not found:", { userId });
      throw new Error("User not found");
    }

    // Determine category and ensure it's a WorkoutType
    let category: WorkoutType | undefined = data.category as WorkoutType;
    if (!category) {
      if (trainer?.specialization?.[0]) {
        category = trainer.specialization[0] as WorkoutType;
      } else if (client?.preferredWorkout) {
        category = client.preferredWorkout as WorkoutType;
      }
    }

    if (!category || !WORKOUT_TYPES.includes(category)) {
      console.error("[DEBUG] Invalid or missing category:", {
        category,
        validCategories: WORKOUT_TYPES,
      });
      throw new Error(`Category must be one of: ${WORKOUT_TYPES.join(", ")}`);
    }

    // Use the provided mediaUrl directly (Cloudinary URL)
    const mediaUrl: string | undefined = data.mediaUrl;

    const role = trainer ? "trainer" : "client";
    let author: {
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
      profileImage?: string;
    } | null = null;

    if (client?.id) {
      author = {
        _id: client.id.toString(),
        firstName: client.firstName || "Unknown",
        lastName: client.lastName || "",
        email: client.email || "",
        profileImage: client.profileImage || undefined,
      };
    } else if (trainer?.id) {
      author = {
        _id: trainer.id.toString(),
        firstName: trainer.firstName || "Unknown",
        lastName: trainer.lastName || "",
        email: trainer.email || "",
        profileImage: trainer.profileImage || undefined,
      };
    }

    if (!author) {
      console.error("[DEBUG] Failed to construct author:", { userId, role });
      throw new Error("Failed to construct author details");
    }

    // Validate textContent
    const textContent = data.textContent || (mediaUrl ? mediaUrl : "");
    if (!textContent) {
      console.error("[DEBUG] Post content is required:", { data });
      throw new Error("Post content is required");
    }

    const postData: Partial<IPostEntity> = {
      id: uuidv4(),
      author,
      authorId: userId,
      role,
      textContent,
      category,
      mediaUrl,
      likes: [],
      isDeleted: false,
      reports: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    console.log(
      "[DEBUG] Post object before saving:",
      JSON.stringify(postData, null, 2)
    );
    const savedPost = await this.postRepository.save(postData);
    console.log(
      "[DEBUG] Saved post from database:",
      JSON.stringify(savedPost, null, 2)
    );

    // Verify and update author if null
    if (!savedPost.author) {
      console.warn("[DEBUG] Saved post missing author, updating:", {
        postId: savedPost.id,
      });
      const updatedPost = await this.postRepository.update(savedPost.id, {
        author,
      });
      console.log(
        "[DEBUG] Updated post with author:",
        JSON.stringify(updatedPost, null, 2)
      );
      if (updatedPost) {
        savedPost.author = updatedPost.author;
      }
    }

    return savedPost;
  }
}