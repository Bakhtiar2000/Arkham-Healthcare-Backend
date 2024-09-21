import { RequestHandler } from "express";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import { specialtiesServices } from "./specialties.service";

const createSpecialties: RequestHandler = catchAsync(async (req, res) => {
  const result = await specialtiesServices.createSpecialtiesIntoDB(req);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Specialty created successfully",
    data: result,
  });
});

const getAllSpecialties = catchAsync(async (req, res) => {
  const result = await specialtiesServices.getAllSpecialtiesFromDB();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Specialties data are fetched successfully",
    data: result,
  });
});

const deleteSpecialty = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await specialtiesServices.deleteSpecialtyFromDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Specialty deleted successfully",
    data: result,
  });
});

export const specialtiesControllers = {
  createSpecialties,
  getAllSpecialties,
  deleteSpecialty,
};
