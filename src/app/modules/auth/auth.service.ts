import prisma from "../../shared/prisma";
import bcrypt from "bcrypt";
import generateToken from "../../utils/generateToken";

const loginUser = async (payload: { email: string; password: string }) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: payload.email,
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
  console.log(token);
};

export const authServices = {
  loginUser,
  refreshToken,
};
