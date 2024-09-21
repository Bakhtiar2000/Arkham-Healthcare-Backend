import { Request, Response } from "express";
import httpStatus from "http-status";
import { patientFilterableFields } from "./patient.constants";
import catchAsync from "../../utils/catchAsync";
import pick from "../../shared/pick";
import sendResponse from "../../utils/sendResponse";
import { patientServices } from "./patient.service";

const getAllPatients = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, patientFilterableFields);
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);

  const result = await patientServices.getAllPatientsFromDB(filters, options);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All Patients retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getAPatientById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await patientServices.getPatientByIdFromDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Patient data retrieved successfully",
    data: result,
  });
});

const updatePatient = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await patientServices.updatePatientIntoDB(id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Patient updated successfully",
    data: result,
  });
});

const deletePatient = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await patientServices.deletePatientFromDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Patient deleted successfully",
    data: result,
  });
});

const softDeletePatient = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await patientServices.softDeletePatientFromDB(id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Patient soft deleted successfully",
    data: result,
  });
});

export const patientControllers = {
  getAllPatients,
  getAPatientById,
  updatePatient,
  deletePatient,
  softDeletePatient,
};
