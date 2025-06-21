export interface IHandleExpiredInvitationsUseCase {
  execute(): Promise<void>;
}