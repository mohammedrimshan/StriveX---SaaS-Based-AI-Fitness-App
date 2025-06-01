
export interface IUpdateFCMTokenUseCase {
    execute(userId: string, fcmToken: string): Promise<void>;
}