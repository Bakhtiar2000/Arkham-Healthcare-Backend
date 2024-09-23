import { Request, RequestHandler } from "express";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import { appointmentServices } from "./appointment.service";
import { TAuthUser } from "../../interfaces/authUser.type";
import pick from "../../shared/pick";
import { appointmentFilterableFields } from "./appointment.constants";

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

const getMyAppointments: RequestHandler = catchAsync(
  async (req: Request & { user?: TAuthUser }, res) => {
    const filters = pick(req.query, ["status", "paymentStatus"]);
    const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);
    const result = await appointmentServices.getMyAppointMents(
      req.user as TAuthUser,
      filters,
      options
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "My Appointments are fetched successfully",
      meta: result.meta,
      data: result.data,
    });
  }
);

const getAllAppointments = catchAsync(async (req, res) => {
  const filters = pick(req.query, appointmentFilterableFields);
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
  const result = await appointmentServices.getAllAppointmentsFromDB(
    filters,
    options
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Appointments retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const changeAppointmentStatus = catchAsync(
  async (req: Request & { user?: TAuthUser }, res) => {
    const result = await appointmentServices.changeAppointmentStatusIntoDB(
      req.user as TAuthUser,
      req.params.id,
      req.body.status
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Appointments status updated successfully",
      data: result,
    });
  }
);

export const appointmentControllers = {
  createAppointment,
  getMyAppointments,
  getAllAppointments,
  changeAppointmentStatus,
};
