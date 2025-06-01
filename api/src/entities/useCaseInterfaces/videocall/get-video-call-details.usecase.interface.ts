
export interface IGetVideoCallDetailsUseCase {
  execute(slotId: string, userId: string, role: "trainer" | "client"): Promise<{
    roomName: string;
    videoCallJwt?: string;
    token?: string;
  }>;
}