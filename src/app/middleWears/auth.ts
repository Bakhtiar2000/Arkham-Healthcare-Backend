import { NextFunction, Request, Response } from "express";
import verifyToken from "../utils/verifyToken";
import config from "../config";
import { Secret } from "jsonwebtoken";

const auth = (...roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization;
      if (!token) {
        throw new Error("You are not authorized!");
      }
      const verifiedUser = verifyToken(
        token,
        config.jwt.access_token_secret as Secret
      );

      if (roles.length && !roles.includes(verifiedUser.role)) {
        throw new Error("You are not authorized!");
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};

export default auth;
