import express, { NextFunction, Request, Response } from "express";

export const dataParser = (req: Request, res: Response, next: NextFunction) => {
  if (req.originalUrl.includes("/client/payment/webhook")) {
    express.raw({ type: "application/json" })(req, res, (err) => {
      if (err) return next(err);
      (req as any).rawBody = req.body;
      next();
    });
  } else {
    express.json()(req, res, next);
  }
};