import { Patient, Prisma, UserStatus } from "@prisma/client";
import { TPatientUpdate, TPatientFilterRequest } from "./patient.interface";
import { patientSearchableFields } from "./patient.constants";
import { TPaginationOptions } from "../../interfaces/pagination.type";
import prisma from "../../shared/prisma";
import calculatePagination from "../../utils/calculatePagination";

const getAllPatientsFromDB = async (
  filters: TPatientFilterRequest,
  options: TPaginationOptions
) => {
  const { limit, page, skip } = calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      OR: patientSearchableFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      AND: Object.keys(filterData).map((key) => {
        return {
          [key]: {
            equals: (filterData as any)[key],
          },
        };
      }),
    });
  }
  andConditions.push({
    isDeleted: false,
  });

  const whereConditions: Prisma.PatientWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.patient.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : {
            createdAt: "desc",
          },
    include: {
      medicalReport: true,
      patientHealthData: true,
    },
  });
  const total = await prisma.patient.count({
    where: whereConditions,
  });

  return {
    meta: {
      total,
      page,
      limit,
    },
    data: result,
  };
};

const getPatientByIdFromDB = async (id: string): Promise<Patient | null> => {
  const result = await prisma.patient.findUnique({
    where: {
      id,
      isDeleted: false,
    },
    include: {
      medicalReport: true,
      patientHealthData: true,
    },
  });
  return result;
};

const updatePatientIntoDB = async (
  id: string,
  payload: Partial<TPatientUpdate>
): Promise<Patient | null> => {
  const { patientHealthData, medicalReport, ...patientData } = payload;

  const patientInfo = await prisma.patient.findUniqueOrThrow({
    where: {
      id,
      isDeleted: false,
    },
  });

  await prisma.$transaction(async (transactionClient) => {
    // Transaction-1: update patient data
    await transactionClient.patient.update({
      where: {
        id,
      },
      data: patientData,
      include: {
        patientHealthData: true,
        medicalReport: true,
      },
    });

    // Transaction-2: create or update patient health data
    if (patientHealthData) {
      await transactionClient.patientHealthData.upsert({
        where: {
          patientId: patientInfo.id,
        },
        update: patientHealthData,
        create: {
          ...patientHealthData,
          patientId: patientInfo.id,
        },
      });
    }

    //  Transaction-3: Cerate medical report
    // Should have used createMany here and the data should have been received as an array as one patient can have many medical reports. Fix it if feels necessary
    if (medicalReport) {
      await transactionClient.medicalReport.create({
        data: {
          ...medicalReport,
          patientId: patientInfo.id,
        },
      });
    }
  });

  const responseData = await prisma.patient.findUnique({
    where: {
      id: patientInfo.id,
    },
    include: {
      patientHealthData: true,
      medicalReport: true,
    },
  });
  return responseData;
};

const deletePatientFromDB = async (id: string): Promise<Patient | null> => {
  const result = await prisma.$transaction(async (t) => {
    //----------------- Transaction-1: delete medical report ------------------
    //In Patient model,  medicalReport MedicalReport[]...... So, one patient can have multiple medical reports. Hence we use 'deleteMany'
    await t.medicalReport.deleteMany({
      where: {
        patientId: id,
      },
    });

    //----------------- Transaction-2: Delete patient health data -----------------
    await t.patientHealthData.delete({
      where: {
        patientId: id,
      },
    });

    //----------------- Transaction-3: Delete patient data -----------------
    const deletedPatient = await t.patient.delete({
      where: {
        id,
      },
    });

    //----------------- Transaction-4: Delete user data ----------------
    await t.user.delete({
      where: {
        email: deletedPatient.email,
      },
    });

    return deletedPatient;
  });

  return result;
};

const softDeletePatientFromDB = async (id: string): Promise<Patient | null> => {
  return await prisma.$transaction(async (tClient) => {
    const deletedPatient = await tClient.patient.update({
      where: { id },
      data: {
        isDeleted: true,
      },
    });

    await tClient.user.update({
      where: {
        email: deletedPatient.email,
      },
      data: {
        status: UserStatus.DELETED,
      },
    });

    return deletedPatient;
  });
};

export const patientServices = {
  getAllPatientsFromDB,
  getPatientByIdFromDB,
  updatePatientIntoDB,
  deletePatientFromDB,
  softDeletePatientFromDB,
};
