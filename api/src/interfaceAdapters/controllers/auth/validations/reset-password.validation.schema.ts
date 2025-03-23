import { ERROR_MESSAGES } from "@/shared/constants";
import { passwordSchema } from "@/shared/validations/password.validation";
import { z } from "zod";

export const resetPasswordValidationSchema = z.object({
	password: passwordSchema,
	token: z.string(),
	role: z.enum(["client", "admin", "trainer"], {
		message: ERROR_MESSAGES.INVALID_ROLE,
	}),
});
