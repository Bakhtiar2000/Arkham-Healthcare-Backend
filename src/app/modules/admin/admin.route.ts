import express from "express";
import { adminControllers } from "./admin.controller";
import validateRequest from "../../utils/validateRequest";
import { adminValidations } from "./admin.validation";
import auth from "../../middleWears/auth";
import { UserRole } from "@prisma/client";

const router = express.Router();

router.get(
  "/",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  adminControllers.getAllAdmins
);

router.get(
  "/:id",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  adminControllers.getSingleAdminById
);

router.patch(
  "/:id",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  validateRequest(adminValidations.updateAdminValidationSchema),
  adminControllers.updateAdmin
);

router.delete(
  "/:id",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  adminControllers.deleteAdmin
);

router.delete(
  "/soft/:id",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  adminControllers.softDeleteAdmin
);

export const adminRoutes = router;
