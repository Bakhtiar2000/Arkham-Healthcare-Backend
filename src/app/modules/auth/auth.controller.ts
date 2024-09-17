import { Request, RequestHandler } from "express";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import { authServices } from "./auth.service";

const loginUser: RequestHandler = catchAsync(async (req, res) => {
  const result = await authServices.loginUser(req.body);

  const { refreshToken } = result;
  res.cookie("refreshToken", refreshToken, {
    secure: false, // Set true before production
    httpOnly: true,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Logged in successfully",
    data: {
      accessToken: result.accessToken,
      needsPasswordChange: result.needsPasswordChange,
    },
  });
});

const refreshToken: RequestHandler = catchAsync(async (req, res) => {
  const { refreshToken } = req.cookies;
  const result = await authServices.refreshToken(refreshToken);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "New Access Token Has Been Generated",
    data: result,
  });
});

const changePassword: RequestHandler = catchAsync(
  async (req: Request & { user?: any }, res) => {
    // As we use req.user, we assign type for this controller
    const result = await authServices.changePassword(req.user, req.body);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Password has been changed",
      data: result,
    });
  }
);

const forgotPassword: RequestHandler = catchAsync(async (req, res) => {
  const result = await authServices.forgotPassword(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Email has been sent",
    data: result,
  });
});

export const authControllers = {
  loginUser,
  refreshToken,
  changePassword,
  forgotPassword,
};
