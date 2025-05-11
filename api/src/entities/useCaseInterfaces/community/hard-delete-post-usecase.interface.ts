export interface IHardDeletePostUseCase {
    execute(postId: string): Promise<boolean>;
  }
  