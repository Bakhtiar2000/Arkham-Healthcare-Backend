import { Admin, Doctor, Patient, Prisma, UserRole } from "@prisma/client";
import bcrypt from "bcrypt";
import prisma from "../../shared/prisma";
import { fileUploader } from "../../utils/fileUploader";
import { IFile } from "../../interfaces/file";
import { Request } from "express";
import { TPaginationOptions } from "../../interfaces/pagination";
import { userSearchableFields } from "./user.constant";
import calculatePagination from "../../utils/calculatePagination";

const createAdminIntoDB = async (req: Request): Promise<Admin> => {
  const file = req.file as IFile;

  // Attaching imageURL with other json data
  if (file) {
    const uploadedImage = await fileUploader.uploadToCloudinary(file);
    req.body.admin.profilePhoto = uploadedImage?.secure_url;
  }
  const hashedPassword: string = await bcrypt.hash(req.body.password, 12);
  const userData = {
    email: req.body.admin.email,
    password: hashedPassword,
    role: UserRole.ADMIN,
  };
  const result = await prisma.$transaction(async (transactionClient) => {
    await transactionClient.user.create({
      data: userData,
    });
    const createdAdminData = await transactionClient.admin.create({
      data: req.body.admin,
    });

    return createdAdminData;
  });
  return result;
};

const createDoctorIntoDB = async (req: Request): Promise<Doctor> => {
  const file = req.file as IFile;

  if (file) {
    const uploadedImage = await fileUploader.uploadToCloudinary(file);
    req.body.doctor.profilePhoto = uploadedImage?.secure_url;
  }
  const hashedPassword: string = await bcrypt.hash(req.body.password, 12);
  const userData = {
    email: req.body.doctor.email,
    password: hashedPassword,
    role: UserRole.DOCTOR,
  };
  const result = await prisma.$transaction(async (transactionClient) => {
    await transactionClient.user.create({
      data: userData,
    });
    const createdDoctorData = await transactionClient.doctor.create({
      data: req.body.doctor,
    });

    return createdDoctorData;
  });
  return result;
};

const createPatientIntoDB = async (req: Request): Promise<Patient> => {
  const file = req.file as IFile;

  if (file) {
    const uploadedImage = await fileUploader.uploadToCloudinary(file);
    req.body.patient.profilePhoto = uploadedImage?.secure_url;
  }
  const hashedPassword: string = await bcrypt.hash(req.body.password, 12);
  const userData = {
    email: req.body.patient.email,
    password: hashedPassword,
    role: UserRole.PATIENT,
  };
  const result = await prisma.$transaction(async (transactionClient) => {
    await transactionClient.user.create({
      data: userData,
    });
    const createdPatientData = await transactionClient.patient.create({
      data: req.body.patient,
    });

    return createdPatientData;
  });
  return result;
};

const getAllUsersFromDB = async (params: any, options: TPaginationOptions) => {
  const andConditions: Prisma.UserWhereInput[] = [];

  const { searchTerm, ...filteredData } = params;
  const { page, limit, skip } = calculatePagination(options);

  if (params.searchTerm) {
    andConditions.push({
      OR: userSearchableFields.map((field) => ({
        [field]: {
          contains: params.searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  if (Object.keys(filteredData).length > 0) {
    andConditions.push({
      AND: Object.keys(filteredData).map((key) => ({
        [key]: {
          equals: (filteredData as any)[key],
        },
      })),
    });
  }

  const result = await prisma.user.findMany({
    where: {
      AND: andConditions,
    },
    skip: skip,
    take: limit,
    orderBy: options.sortBy
      ? options.sortOrder
        ? {
            [options.sortBy]: options.sortOrder,
          }
        : {
            [options.sortBy]: "asc",
          }
      : {
          createdAt: "desc",
        },
  });
  const total = await prisma.user.count({
    where: {
      AND: andConditions,
    },
  });
  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

export const userServices = {
  createAdminIntoDB,
  createDoctorIntoDB,
  createPatientIntoDB,
  getAllUsersFromDB,
};
