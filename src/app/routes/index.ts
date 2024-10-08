import express from "express";
import { userRoutes } from "../modules/user/user.route";
import { adminRoutes } from "../modules/admin/admin.route";
import { authRoutes } from "../modules/auth/auth.route";
import { specialtiesRoutes } from "../modules/specialties/specialties.route";
import { doctorRoutes } from "../modules/doctor/doctor.route";
import { patientRoutes } from "../modules/patient/patient.route";
import { scheduleRoutes } from "../modules/schedule/schedule.route";
import { doctorScheduleRoutes } from "../modules/doctorSchedule/doctorSchedule.route";
import { appointmentRoutes } from "../modules/appointment/appointment.route";
import { paymentRoutes } from "../modules/payment/payment.route";
import { prescriptionRoutes } from "../modules/prescription/prescription.route";
import { reviewRoutes } from "../modules/review/review.route";
import { metaRoutes } from "../modules/meta/meta.route";

const router = express.Router();

const moduleRoutes = [
  {
    path: "/user",
    route: userRoutes,
  },
  {
    path: "/admin",
    route: adminRoutes,
  },
  {
    path: "/auth",
    route: authRoutes,
  },
  {
    path: "/specialties",
    route: specialtiesRoutes,
  },
  {
    path: "/doctor",
    route: doctorRoutes,
  },
  {
    path: "/patient",
    route: patientRoutes,
  },
  {
    path: "/schedule",
    route: scheduleRoutes,
  },
  {
    path: "/doctor-schedule",
    route: doctorScheduleRoutes,
  },
  {
    path: "/appointment",
    route: appointmentRoutes,
  },
  {
    path: "/payment",
    route: paymentRoutes,
  },
  {
    path: "/prescription",
    route: prescriptionRoutes,
  },
  {
    path: "/review",
    route: reviewRoutes,
  },
  {
    path: "/meta",
    route: metaRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
