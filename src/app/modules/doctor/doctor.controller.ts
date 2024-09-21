import { Request, Response } from "express";
import httpStatus from "http-status";
import { DoctorService } from "./doctor.service";
import { doctorFilterableFields } from "./doctor.constants";
import catchAsync from "../../utils/catchAsync";
import pick from "../../shared/pick";
import sendResponse from "../../utils/sendResponse";

const getAllDoctors = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, doctorFilterableFields);
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
  const result = await DoctorService.getAllDoctorsFromDB(filters, options);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All Doctors retrieval successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getDoctorById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await DoctorService.getDoctorByIdFromDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Doctor data retrieval successfully",
    data: result,
  });
});

const updateDoctor = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await DoctorService.updateDoctorIntoDB(id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Doctor data updated successfully!",
    data: result,
  });
});

const deleteDoctor = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await DoctorService.deleteDoctorFromDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Doctor deleted successfully",
    data: result,
  });
});

const softDeleteDoctor = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await DoctorService.softDeleteDoctor(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Doctor soft deleted successfully",
    data: result,
  });
});

export const doctorControllers = {
  getAllDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
  softDeleteDoctor,
};
