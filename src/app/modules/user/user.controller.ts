import { Request, Response } from "express";
import { userServices } from "./user.service";
import { IFile } from "../../interfaces/file";

const createAdmin = async (req: Request, res: Response) => {
  try {
    const result = await userServices.createAdmin(req);
    res.status(200).json({
      success: true,
      message: "User created successfully",
      data: result,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err?.name || "Something went wrong",
      error: err,
    });
  }
};

export const userControllers = {
  createAdmin,
};
