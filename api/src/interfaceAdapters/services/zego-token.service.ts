// D:\StriveX\api\src\interfaceAdapters\services\zego-token.service.ts
import { injectable } from "tsyringe";
import { config } from "@/shared/config";
import { ZegoToken } from "@/shared/utils/ZegoToken";

@injectable()
export class ZegoTokenService {
  private readonly appID: number;
  private readonly serverSecret: string;

  constructor() {
    const appID = parseInt(config.zegocloud.APP_ID);
    const serverSecret = config.zegocloud.SERVER_SECRET;

    if (isNaN(appID) || !serverSecret) {
      throw new Error("Invalid ZEGO_APP_ID or ZEGO_SERVER_SECRET in environment config");
    }

    this.appID = appID;
    this.serverSecret = serverSecret;
  }

  generateToken(userId: string, roomId: string, effectiveTimeInSeconds: number = 3600): string {
    try {
      return ZegoToken.generateToken04(
        this.appID,
        userId,
        this.serverSecret,
        effectiveTimeInSeconds,
        roomId
      );
    } catch (error) {
      console.error("Error generating Zego token:", error);
      throw new Error("Failed to generate Zego token");
    }
  }
}