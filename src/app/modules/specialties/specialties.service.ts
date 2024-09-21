import { Request } from "express";
import { fileUploader } from "../../utils/fileUploader";
import { IFile } from "../../interfaces/file.type";
import prisma from "../../shared/prisma";
import { Specialties } from "@prisma/client";

const createSpecialtiesIntoDB = async (req: Request) => {
  const file = req.file as IFile;
  if (file) {
    const uploadToCloudinary = await fileUploader.uploadToCloudinary(file);
    req.body.icon = uploadToCloudinary?.secure_url;
  }

  const result = await prisma.specialties.create({
    data: req.body,
  });
  return result;
};

const getAllSpecialtiesFromDB = async (): Promise<Specialties[]> => {
  return await prisma.specialties.findMany();
};

const deleteSpecialtyFromDB = async (id: string): Promise<Specialties> => {
  const result = await prisma.specialties.delete({
    where: {
      id,
    },
  });
  return result;
};

export const specialtiesServices = {
  createSpecialtiesIntoDB,
  getAllSpecialtiesFromDB,
  deleteSpecialtyFromDB,
};
