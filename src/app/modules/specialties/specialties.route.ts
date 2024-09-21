import express, { NextFunction, Request, Response } from "express";
import { specialtiesControllers } from "./specialties.controller";
import auth from "../../middleWears/auth";
import { UserRole } from "@prisma/client";
import { fileUploader } from "../../utils/fileUploader";

const router = express.Router();

router.post(
  "/",
  auth(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  fileUploader.upload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = JSON.parse(req.body.data);
    return specialtiesControllers.createSpecialties(req, res, next);
  }
);

export const specialtiesRoutes = router;
