import express from "express";
import { paymentControllers } from "./payment.controller";

const router = express.Router();

router.post("/init-payment/:appointmentId", paymentControllers.initPayment);

export const paymentRoutes = router;
