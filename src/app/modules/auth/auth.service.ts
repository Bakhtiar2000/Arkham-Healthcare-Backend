import prisma from "../../shared/prisma";
import bcrypt from "bcrypt";
import { generateToken } from "./auth.utils";
import { Secret } from "jsonwebtoken";
import { verifyToken } from "./auth.utils";
import { UserStatus } from "@prisma/client";
import config from "../../config";
import sendMail from "../../utils/sendMail";
import ApiError from "../../errors/apiError";
import httpStatus from "http-status";

const loginUser = async (payload: { email: string; password: string }) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: payload.email,
      status: UserStatus.ACTIVE,
    },
  });

  const isCorrectPassword: boolean = await bcrypt.compare(
    payload.password,
    userData.password
  );
  if (!isCorrectPassword) {
    throw new Error("Password is incorrect");
  }

  const tokenPayload = {
    email: userData.email,
    role: userData.role,
  };

  const accessToken = generateToken(
    tokenPayload,
    config.jwt.access_token_secret as Secret,
    config.jwt.access_token_expires_in as string
  );
  const refreshToken = generateToken(
    tokenPayload,
    config.jwt.refresh_token_secret as Secret,
    config.jwt.refresh_token_expires_in as string
  );

  return {
    accessToken,
    refreshToken,
    needsPasswordChange: userData.needPasswordChange,
  };
};

const refreshToken = async (token: string) => {
  let decodedData;
  try {
    decodedData = verifyToken(token, config.jwt.refresh_token_secret as Secret);
  } catch (err) {
    throw new Error("You are not authorized!");
  }

  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: decodedData?.email,
      status: UserStatus.ACTIVE,
    },
  });
  const tokenPayload = {
    email: userData.email,
    role: userData.role,
  };
  const accessToken = generateToken(
    tokenPayload,
    config.jwt.access_token_secret as Secret,
    config.jwt.access_token_expires_in as string
  );

  return {
    accessToken,
    needsPasswordChange: userData.needPasswordChange,
  };
};

const changePassword = async (user: any, payload: any) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: user?.email,
      status: UserStatus.ACTIVE,
    },
  });

  const isCorrectPassword: boolean = await bcrypt.compare(
    payload.oldPassword,
    userData.password
  );
  if (!isCorrectPassword) {
    throw new Error("Password is incorrect");
  }

  const hashedPassword: string = await bcrypt.hash(payload.newPassword, 12);

  // Update operation
  await prisma.user.update({
    where: {
      email: userData?.email,
    },
    data: {
      password: hashedPassword,
      needPasswordChange: false,
    },
  });
  return {
    message: "Password changed successfully!",
  };
};

const forgotPassword = async (payload: { email: string }) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: payload?.email,
      status: UserStatus.ACTIVE,
    },
  });

  const tokenPayload = {
    email: userData.email,
    role: userData.role,
  };

  const resetPasswordToken = generateToken(
    tokenPayload,
    config.jwt.reset_pass_token_secret as Secret,
    config.jwt.reset_pass_token_expires_in as string
  );

  // Example of reset pass Link ->
  // http://localhost:3000/reset-pass?userId=f74d5fa0-9f3d-48e8-a722-4c8179060d5a&token=XXXXXXXXXXXXX
  const resetPassLink =
    config.reset_pass_link +
    `?userId=${userData.id}&token=${resetPasswordToken}`;

  await sendMail(
    userData.email,
    `<div>
        <p>Dear User,</p>
        <p>Click on this Button to reset password. Link expires in 10 minutes.</p> 
        <p>
            <a href=${resetPassLink}>
                <button>
                    Reset Password
                </button>
            </a>
        </p>
    </div>`
  );
};

const resetPassword = async (
  token: string,
  payload: { id: string; password: string }
) => {
  console.log({ token, payload });

  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      id: payload.id,
      status: UserStatus.ACTIVE,
    },
  });

  const isValidToken = verifyToken(
    token,
    config.jwt.reset_pass_token_secret as Secret
  );

  if (!isValidToken) {
    throw new ApiError(httpStatus.FORBIDDEN, "User is Forbidden!");
  }

  // hash password
  const password = await bcrypt.hash(payload.password, 12);

  // update into database
  await prisma.user.update({
    where: {
      id: payload.id,
    },
    data: {
      password,
    },
  });
};

export const authServices = {
  loginUser,
  refreshToken,
  changePassword,
  forgotPassword,
  resetPassword,
};
