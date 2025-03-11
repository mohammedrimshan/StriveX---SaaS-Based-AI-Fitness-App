import { randomUUID } from "crypto";

export const generateUniqueId = (prefix: string = "user") => {
	return `striveX-${prefix}-${randomUUID().slice(10)}`;
};
