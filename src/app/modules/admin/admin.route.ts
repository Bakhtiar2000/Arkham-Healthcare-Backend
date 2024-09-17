import express from "express";
import { adminControllers } from "./admin.controller";
import validateRequest from "../../utils/validateRequest";
import { adminValidations } from "./admin.validation";

const router = express.Router();

router.get("/", adminControllers.getAllAdmins);
router.get("/:id", adminControllers.getSingleAdminById);
router.patch(
  "/:id",
  validateRequest(adminValidations.updateAdminValidationSchema),
  adminControllers.updateAdmin
);
router.delete("/:id", adminControllers.deleteAdmin);
router.delete("/soft/:id", adminControllers.softDeleteAdmin);

export const adminRoutes = router;
