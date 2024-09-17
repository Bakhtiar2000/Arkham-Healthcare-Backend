import jwt, { JwtPayload, Secret } from "jsonwebtoken";

const verifyToken = (token: string, secret: Secret) => {
  return jwt.verify(token, secret) as JwtPayload;
};

export default verifyToken;
