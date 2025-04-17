import { CustomJwtPayload } from "@/interfaceAdapters/middlewares/auth.middleware";
declare global {
  namespace Express {
    interface Request {
      user?: CustomJwtPayload;
    }
  }
}
