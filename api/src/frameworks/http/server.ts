import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import express, { Application, NextFunction, Request, Response } from "express";
import morgan from "morgan";
import fileUpload from "express-fileupload";
import { config } from "../../shared/config";
import { AuthRoutes } from "../routes/auth/auth.route";
import { PrivateRoutes } from "../routes/private/private.route";
import { ChatRoutes } from "../routes/chat/chat.route";
import { HealthRoute } from "../routes/health.route";
import { dataParser } from "@/interfaceAdapters/middlewares/dataParserMiddleware";
import { notFound } from "@/interfaceAdapters/middlewares/not-found.middleware";
import { errorHandler } from "../../interfaceAdapters/middlewares/error.middlewares";

export class Server {
  private _app: Application;
  constructor() {
    this._app = express();
    this.configureMiddleware();
    this.configureRoutes();
    this.configureErrorHandling();
  }

  private configureMiddleware(): void {
    this._app.use(morgan(config.loggerStatus));
    this._app.use(helmet());
    this._app.use(
      cors({
        origin: config.cors.ALLOWED_ORIGIN,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Authorization", "Content-Type"],
        credentials: true,
      })
    );

    this._app.use(dataParser);

    this._app.use(express.json({ limit: "40mb" }));
    this._app.use(express.urlencoded({ limit: "40mb", extended: true }));

    this._app.use(
      fileUpload({
        limits: { fileSize: 50 * 1024 * 1024 },
        abortOnLimit: true,
      })
    );

    this._app.use(cookieParser());

    this._app.use(
      rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 1000,
      })
    );
  }

  private configureRoutes(): void {
    this._app.use("/api/v1/auth", new AuthRoutes().router);
    this._app.use("/api/v1/pvt", new PrivateRoutes().router);
    this._app.use("/api/v1/pvt/_cl/chats", new ChatRoutes().router);
    this._app.use("/api/v1/pvt/_tra/chats", new ChatRoutes().router);
    this._app.use("/api/v1", new HealthRoute().router);
    this._app.use("*", notFound);
  }

  private configureErrorHandling(): void {
    this._app.use(errorHandler);
  }

  public getApp(): Application {
    return this._app;
  }
}