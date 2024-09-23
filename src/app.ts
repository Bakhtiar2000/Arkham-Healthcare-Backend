import express, { Application, Request, Response } from "express";
import cors from "cors";
import router from "./app/routes";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import notFound from "./app/middlewares/notFound";
import cookieParser from "cookie-parser";
import cron from "node-cron";
import { appointmentServices } from "./app/modules/appointment/appointment.service";

const app: Application = express();
app.use(cors());
app.use(cookieParser());

// Parsers / MiddleWears
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/v1", router);
app.use(globalErrorHandler);
app.use(notFound);

// This function will run after every minute (1 min) and checks if Unpaid Appointments are to be canceled or not
cron.schedule("* * * * *", () => {
  try {
    appointmentServices.cancelUnpaidAppointmentsFromDB();
  } catch (error) {
    console.log(error);
  }
});

app.get("/", (req: Request, res: Response) => {
  res.send({
    message: "Arkham healthcare Server",
  });
});

export default app;
