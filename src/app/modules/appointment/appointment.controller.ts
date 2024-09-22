import { Request, RequestHandler } from "express";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import { appointmentServices } from "./appointment.service";
import { TAuthUser } from "../../interfaces/authUser.type";

const createAppointment: RequestHandler = catchAsync(
  async (req: Request & { user?: TAuthUser }, res) => {
    const result = await appointmentServices.createAppointmentIntoDB(
      req.user as TAuthUser,
      req.body
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Appointment created successfully",
      data: result,
    });
  }
);

export const appointmentControllers = {
  createAppointment,
};
