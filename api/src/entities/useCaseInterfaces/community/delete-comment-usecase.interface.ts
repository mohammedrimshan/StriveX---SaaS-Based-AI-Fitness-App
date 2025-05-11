export interface IDeleteCommentUseCase {
    execute(commentId: string, userId: string): Promise<boolean>;
  }
  