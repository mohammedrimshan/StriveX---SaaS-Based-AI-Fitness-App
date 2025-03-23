import { NextFunction, Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import { JWTService } from "../services/jwt.service";
import { ERROR_MESSAGES, HTTP_STATUS } from "../../shared/constants";
import client from "../../frameworks/cache/redis.client";

const tokenService = new JWTService();

export interface CustomJwtPayload extends JwtPayload {
	id: string;
	email: string;
	role: string;
	access_token: string;
	refresh_token: string;
}

export interface CustomRequest extends Request {
	user: CustomJwtPayload;
}

export const verifyAuth = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const token = extractToken(req);
		console.log("Token extracted:", extractToken(req));
		if (!token) {
			res.status(HTTP_STATUS.UNAUTHORIZED).json({
				success: false,
				message: ERROR_MESSAGES.UNAUTHORIZED_ACCESS,
			});
			return;
		}
		if (await isBlacklisted(token.access_token)) {
			res.status(HTTP_STATUS.FORBIDDEN).json({
				success: false,
				message: ERROR_MESSAGES.TOKEN_BLACKLISTED,
			});
			return;
		}
		const user = tokenService.verifyAccessToken(
			token.access_token
		) as CustomJwtPayload;
		console.log("User after verification:", user);
		if (!user || !user.id) {
			res.status(HTTP_STATUS.UNAUTHORIZED).json({
				message: ERROR_MESSAGES.TOKEN_EXPIRED,
			});
			return;
		}
		(req as CustomRequest).user = {
			...user,
			access_token: token.access_token,
			refresh_token: token.refresh_token,
		};
		next();
	} catch (error: any) {
		if (error.name === "TokenExpiredError") {
			console.log(error.name);
			res.status(HTTP_STATUS.UNAUTHORIZED).json({
				message: ERROR_MESSAGES.TOKEN_EXPIRED,
			});
			return;
		}

		console.log("Invalid token response sent");
		res.status(HTTP_STATUS.UNAUTHORIZED).json({
			message: ERROR_MESSAGES.INVALID_TOKEN,
		});
		return;
	}
};

const extractToken = (
	req: Request
): { access_token: string; refresh_token: string } | null => {
	const userType = req.path.split("/")[1];

	if (!userType) return null;

	return {
		access_token: req.cookies?.[`${userType}_access_token`] ?? null,
		refresh_token: req.cookies?.[`${userType}_refresh_token`] ?? null,
	};
};

const isBlacklisted = async (token: string): Promise<boolean> => {
	try {
		const result = await client.get(token);
		return result !== null;
	} catch (error) {
		console.error("Redis error:", error);
		return false;
	}
};

export const authorizeRole = (allowedRoles: string[]) => {
	return (req: Request, res: Response, next: NextFunction) => {
		const user = (req as CustomRequest).user;
		console.log(user.role)
		if (!user || !allowedRoles.includes(user.role)) {
			res.status(HTTP_STATUS.FORBIDDEN).json({
				success: false,
				message: ERROR_MESSAGES.NOT_ALLOWED,
				userRole: user ? user.role : "none",
			});
			return;
		}
		next();
	};
};

export const decodeToken = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const token = extractToken(req);

		if (!token) {
			console.log("no token");
			res.status(HTTP_STATUS.UNAUTHORIZED).json({
				message: ERROR_MESSAGES.UNAUTHORIZED_ACCESS,
			});
			return;
		}
		if (await isBlacklisted(token.access_token)) {
			console.log("token is black listed is worked");
			res.status(HTTP_STATUS.FORBIDDEN).json({
				message: ERROR_MESSAGES.TOKEN_BLACKLISTED,
			});
			return;
		}

		const user = tokenService.decodeAccessToken(token?.access_token);
		console.log("decoded", user);
		(req as CustomRequest).user = {
			id: user?.id,
			email: user?.email,
			role: user?.role,
			access_token: token.access_token,
			refresh_token: token.refresh_token,
		};
		next();
	} catch (error) {}
};
