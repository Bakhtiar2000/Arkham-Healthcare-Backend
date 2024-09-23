import { AppointmentStatus, PaymentStatus, Prescription } from "@prisma/client";
import { TAuthUser } from "../../interfaces/authUser.type";
import prisma from "../../shared/prisma";
import httpStatus from "http-status";
import ApiError from "../../errors/apiError";
import calculatePagination from "../../utils/calculatePagination";
import { TPaginationOptions } from "../../interfaces/pagination.type";

const ceratePrescriptionIntoDB = async (
  user: TAuthUser,
  payload: Prescription
) => {
  const appointmentData = await prisma.appointment.findUniqueOrThrow({
    where: {
      id: payload.appointmentId,
      status: AppointmentStatus.COMPLETED,
      paymentStatus: PaymentStatus.PAID, // If payment done and appointment completed, then doctor can upload prescription
    },
    include: {
      doctor: true,
    },
  });

  if (user?.email !== appointmentData.doctor.email) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Unauthorized access. This is not your appointment!"
    );
  }

  const result = await prisma.prescription.create({
    data: {
      appointmentId: appointmentData.id,
      doctorId: appointmentData.doctorId,
      patientId: appointmentData.patientId,
      instructions: payload.instructions,
      followUpDate: payload.followUpDate,
    },
    include: {
      patient: true,
    },
  });

  return result;
};

const getMyPrescriptionsFromDB = async (
  user: TAuthUser,
  options: TPaginationOptions
) => {
  const { limit, page, skip } = calculatePagination(options);

  const result = await prisma.prescription.findMany({
    where: {
      patient: {
        email: user?.email,
      },
    },
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : { createdAt: "desc" },
    include: {
      doctor: true,
    },
  });

  const total = await prisma.prescription.count({
    where: {
      patient: {
        email: user?.email,
      },
    },
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

export const prescriptionServices = {
  ceratePrescriptionIntoDB,
  getMyPrescriptionsFromDB,
};
