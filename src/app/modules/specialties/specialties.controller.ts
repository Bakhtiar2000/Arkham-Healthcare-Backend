import { RequestHandler } from "express";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import { specialtiesService } from "./specialties.service";

const createSpecialties: RequestHandler = catchAsync(async (req, res) => {
  const result = await specialtiesService.createSpecialtiesIntoDB(req);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Specialty created successfully",
    data: result,
  });
});

export const specialtiesControllers = {
  createSpecialties,
};
