import { config } from "../../shared/config";
import { IBcrypt } from "./bcrypt.interface";
import bcrypt from "bcryptjs";

export class OtpBcrypt implements IBcrypt {
	async hash(original: string): Promise<string> {
		return bcrypt.hash(original, config.bcryptSaltRounds);
	}

   async compare(current: string, original: string): Promise<boolean> {
       return bcrypt.compare(current, original)
   }
}
