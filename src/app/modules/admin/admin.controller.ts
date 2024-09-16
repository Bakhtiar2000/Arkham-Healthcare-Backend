import { Request, Response } from "express";
import { adminServices } from "./admin.service";
import pick from "../../shared/pick";
import { adminFIlterableFields } from "./admin.constant";

const getAllAdmins = async (req: Request, res: Response) => {
  try {
    // Searches on only adminFIlterableFields and ignores other query fields
    const filters = pick(req.query, adminFIlterableFields);
    const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);
    const result = await adminServices.getAllAdminsFromDB(filters, options);
    res.status(200).json({
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
    res.status(200).json({
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
    res.status(200).json({
      success: true,
      message: "Admin data updated successfully",
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
};
