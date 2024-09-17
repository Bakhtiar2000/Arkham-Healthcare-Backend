import prisma from "../../shared/prisma";
import bcrypt from "bcrypt";
import generateToken from "../../utils/generateToken";
import jwt, { Secret } from "jsonwebtoken";
import verifyToken from "../../utils/verifyToken";
import { UserStatus } from "@prisma/client";
import config from "../../config";

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

export const authServices = {
  loginUser,
  refreshToken,
};
