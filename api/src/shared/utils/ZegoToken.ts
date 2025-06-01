// D:\StriveX\api\src\shared\utils\zego-token.ts
import * as crypto from "crypto";

export class ZegoToken {
  static generateToken04(
    appID: number,
    userID: string,
    serverSecret: string,
    effectiveTimeInSeconds: number,
    roomID: string
  ): string {
    const nonce = Math.floor(Math.random() * 1000000000); // Larger nonce for uniqueness
    const ctime = Math.floor(Date.now() / 1000);
    const expire = ctime + effectiveTimeInSeconds; // Expire as timestamp

    const payload = {
      app_id: appID,
      user_id: userID,
      nonce,
      ctime,
      expire,
      room_id: roomID,
    };

    const payloadStr = JSON.stringify(payload);
    const hash = crypto
      .createHmac("sha256", serverSecret)
      .update(payloadStr)
      .digest("hex");

    const tokenObj = {
      ver: 4,
      hash,
      payload: payloadStr,
    };

    return Buffer.from(JSON.stringify(tokenObj)).toString("base64");
  }
}