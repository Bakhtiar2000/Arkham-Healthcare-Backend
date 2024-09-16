import { Request, Response } from "express";
import { adminServices } from "./admin.service";
import pick from "../../shared/pick";
import { adminFIlterableFields } from "./admin.constant";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";

const getAllAdmins = async (req: Request, res: Response) => {
  try {
    // Searches on only adminFIlterableFields and ignores other query fields
    const filters = pick(req.query, adminFIlterableFields);
    const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);
    const result = await adminServices.getAllAdminsFromDB(filters, options);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Admins are fetched successfully",
      meta: result.meta,
      data: result.data,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err?.name || "Something went wrong!",
      error: err,
    });
  }
};

const getSingleAdminById = async (req: Request, res: Response) => {
  try {
    const result = await adminServices.getSingleAdminByIdFromDB(req.params.id);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Admin is fetched successfully",
      data: result,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err?.name || "Something went wrong!",
      error: err,
    });
  }
};

const updateAdmin = async (req: Request, res: Response) => {
  try {
    const result = await adminServices.updateIntoDB(req.params.id, req.body);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Admins data updated successfully",
      data: result,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err?.name || "Something went wrong!",
      error: err,
    });
  }
};

const deleteAdmin = async (req: Request, res: Response) => {
  try {
    const result = await adminServices.deleteAdminFromDB(req.params.id);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Admin deleted successfully",
      data: result,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err?.name || "Something went wrong!",
      error: err,
    });
  }
};

const softDeleteAdmin = async (req: Request, res: Response) => {
  try {
    const result = await adminServices.softDeleteAdminFromDB(req.params.id);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Admin deleted successfully",
      data: result,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err?.name || "Something went wrong!",
      error: err,
    });
  }
};

export const adminControllers = {
  getAllAdmins,
  getSingleAdminById,
  updateAdmin,
  deleteAdmin,
  softDeleteAdmin,
};
