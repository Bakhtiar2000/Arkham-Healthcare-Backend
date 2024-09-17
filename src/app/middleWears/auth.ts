import { NextFunction, Request, Response } from "express";
import verifyToken from "../utils/verifyToken";
import config from "../config";
import { Secret } from "jsonwebtoken";
import ApiError from "../errors/apiError";
import httpStatus from "http-status";

const auth = (...roles: string[]) => {
  return async (
    req: Request & { user?: any }, // req has access to both Request and user type now.
    res: Response,
    next: NextFunction
  ) => {
    try {
      const token = req.headers.authorization;
      if (!token) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "You are not authorized!");
      }
      const verifiedUser = verifyToken(
        token,
        config.jwt.access_token_secret as Secret
      );

      req.user = verifiedUser;
      if (roles.length && !roles.includes(verifiedUser.role)) {
        throw new ApiError(httpStatus.FORBIDDEN, "You are not Forbidden!");
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};

export default auth;
