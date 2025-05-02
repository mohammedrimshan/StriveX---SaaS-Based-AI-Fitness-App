export interface IGetChatParticipantsUseCase {
    execute(userId: string, role: string): Promise<Array<{
      id: string;
      name: string;
      avatar: string;
      status: "online" | "offline";
    }>>;
  }