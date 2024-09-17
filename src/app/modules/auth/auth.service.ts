import prisma from "../../shared/prisma";
import bcrypt from "bcrypt";
import generateToken from "../../utils/generateToken";
import jwt from "jsonwebtoken";
import verifyToken from "../../utils/verifyToken";
import { UserStatus } from "@prisma/client";

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

  const accessToken = generateToken(tokenPayload, "abcdefgh", "5m");
  const refreshToken = generateToken(tokenPayload, "abcdefghijklmnop", "30d");

  return {
    accessToken,
    refreshToken,
    needsPasswordChange: userData.needPasswordChange,
  };
};

const refreshToken = async (token: string) => {
  let decodedData;
  try {
    decodedData = verifyToken(token, "abcdefghijklmnop");
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
  const accessToken = generateToken(tokenPayload, "abcdefgh", "5m");

  return {
    accessToken,
    needsPasswordChange: userData.needPasswordChange,
  };
};

export const authServices = {
  loginUser,
  refreshToken,
};
