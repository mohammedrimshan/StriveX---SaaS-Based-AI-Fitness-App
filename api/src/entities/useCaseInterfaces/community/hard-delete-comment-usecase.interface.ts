export interface IHardDeleteCommentUseCase {
    execute(commentId: string): Promise<boolean>;
  }
  