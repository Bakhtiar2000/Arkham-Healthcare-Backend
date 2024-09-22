import { Request, RequestHandler } from "express";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import { doctorScheduleServices } from "./doctorSchedule.service";
import { TAuthUser } from "../../interfaces/authUser.type";
import pick from "../../shared/pick";

const createDoctorSchedule: RequestHandler = catchAsync(
  async (req: Request & { user?: TAuthUser }, res) => {
    const result = await doctorScheduleServices.createDoctorScheduleIntoDB(
      req.user as TAuthUser,
      req.body
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Doctor Schedule created successfully",
      data: result,
    });
  }
);

const getMySchedule = catchAsync(
  async (req: Request & { user?: TAuthUser }, res) => {
    const filters = pick(req.query, ["start", "end", "isBooked"]);
    const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
    const result = await doctorScheduleServices.getMyScheduleFromDB(
      filters,
      options,
      req.user as TAuthUser
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "My Schedule fetched successfully",
      data: result,
    });
  }
);

const deleteMySchedule = catchAsync(
  async (req: Request & { user?: TAuthUser }, res) => {
    const result = await doctorScheduleServices.deleteMyScheduleFromDB(
      req.user as TAuthUser,
      req.params.id
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Schedule deleted successfully",
      data: result,
    });
  }
);

export const doctorScheduleControllers = {
  createDoctorSchedule,
  getMySchedule,
  deleteMySchedule,
};
