import {
  AppointmentStatus,
  PaymentStatus,
  Prisma,
  UserRole,
} from "@prisma/client";
import { TAuthUser } from "../../interfaces/authUser.type";
import { TPaginationOptions } from "../../interfaces/pagination.type";
import prisma from "../../shared/prisma";
import { v4 as uuidV4 } from "uuid";
import calculatePagination from "../../utils/calculatePagination";
import ApiError from "../../errors/apiError";
import httpStatus from "http-status";

const createAppointmentIntoDB = async (user: TAuthUser, payload: any) => {
  const { doctorId, scheduleId } = payload;
  const patientData = await prisma.patient.findUniqueOrThrow({
    where: {
      email: user?.email,
    },
  });
  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: {
      id: doctorId,
    },
  });
  const scheduleData = await prisma.doctorSchedules.findFirstOrThrow({
    where: {
      scheduleId: scheduleId,
      doctorId: doctorId,
      isBooked: false,
    },
  });

  const videoCallingId = uuidV4();

  const result = await prisma.$transaction(async (tx) => {
    //------------------- Transaction-1: Create appointment -------------------
    const appointmentData = await tx.appointment.create({
      data: {
        patientId: patientData.id,
        doctorId: doctorData.id,
        scheduleId: payload.scheduleId,
        videoCallingId,
      },
      include: {
        patient: true,
        doctor: true,
        schedule: true,
      },
    });

    //------------------- Transaction-2: Update doctorSchedules isBooked true -------------------
    await tx.doctorSchedules.update({
      where: {
        doctorId_scheduleId: {
          doctorId: doctorData.id,
          scheduleId: payload.scheduleId,
        },
      },
      data: {
        isBooked: true,
        appointmentId: appointmentData.id,
      },
    });

    //------------------- Transaction-3: Cerate Payment -------------------
    const today = new Date();
    // timeStamp as transactionId
    const transactionId =
      "Arkham-HealthCare-" +
      today.getFullYear() +
      "-" +
      today.getMonth() +
      "-" +
      today.getDay() +
      "-" +
      today.getHours() +
      "-" +
      today.getMinutes() +
      "-" +
      today.getSeconds() +
      "-" +
      today.getMilliseconds();
    await tx.payment.create({
      data: {
        appointmentId: appointmentData.id,
        amount: doctorData.appointmentFee,
        transactionId,
      },
    });

    return appointmentData;
  });

  return result;
};

const getMyAppointMents = async (
  user: TAuthUser,
  filters: any,
  options: TPaginationOptions
) => {
  const { limit, page, skip } = calculatePagination(options);
  const { ...filterData } = filters;

  const andConditions: Prisma.AppointmentWhereInput[] = [];

  if (user?.role === UserRole.PATIENT) {
    andConditions.push({
      patient: {
        email: user?.email,
      },
    });
  } else if (user?.role === UserRole.DOCTOR) {
    andConditions.push({
      doctor: {
        email: user?.email,
      },
    });
  }

  if (Object.keys(filterData).length > 0) {
    const filterConditions = Object.keys(filterData).map((key) => ({
      [key]: {
        equals: (filterData as any)[key],
      },
    }));
    andConditions.push(...filterConditions);
  }

  const whereConditions: Prisma.AppointmentWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.appointment.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : { createdAt: "desc" },
    include:
      // Patients see doctor's details and doctors can see patient's details
      user?.role === UserRole.PATIENT
        ? { doctor: true, schedule: true }
        : {
            patient: {
              include: { medicalReport: true, patientHealthData: true },
            },
            schedule: true,
          },
  });

  const total = await prisma.appointment.count({
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

const getAllAppointmentsFromDB = async (
  filters: any,
  options: TPaginationOptions
) => {
  const { limit, page, skip } = calculatePagination(options);
  const { patientEmail, doctorEmail, ...filterData } = filters;
  const andConditions = [];

  if (patientEmail) {
    andConditions.push({
      patient: {
        email: patientEmail,
      },
    });
  } else if (doctorEmail) {
    andConditions.push({
      doctor: {
        email: doctorEmail,
      },
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

  // console.dir(andConditions, { depth: Infinity })
  const whereConditions: Prisma.AppointmentWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.appointment.findMany({
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
      doctor: true,
      patient: true,
    },
  });
  const total = await prisma.appointment.count({
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

const changeAppointmentStatusIntoDB = async (
  user: TAuthUser,
  id: string,
  status: AppointmentStatus
) => {
  const appointmentData = await prisma.appointment.findUniqueOrThrow({
    where: {
      id,
    },
    include: {
      doctor: true,
    },
  });

  if (
    user?.role === UserRole.DOCTOR &&
    user?.email !== appointmentData.doctor.email
  ) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Unauthorized access. Wrong appointment!"
    );
  }

  const result = prisma.appointment.update({
    where: {
      id,
    },
    data: {
      status,
    },
  });

  return result;
};

const cancelUnpaidAppointmentsFromDB = async () => {
  // We calculate 30 minutes before present time and find if any appointment was created before that time
  const duration = new Date(Date.now() - 30 * 60 * 1000); // 30 minutes ago

  const unpaidAppointments = await prisma.appointment.findMany({
    where: {
      createdAt: {
        lte: duration,
      },
      paymentStatus: PaymentStatus.UNPAID,
    },
  });

  const appointmentIdsToCancel = unpaidAppointments.map(
    (appointment) => appointment.id
  );

  await prisma.$transaction(async (tx) => {
    //--------------- Transaction-1: Delete all unpaid appointment data from payment database ---------------
    await tx.payment.deleteMany({
      where: {
        appointmentId: {
          in: appointmentIdsToCancel,
        },
      },
    });

    //--------------- Transaction-2: Delete all unpaid appointments from appointment database ---------------
    await tx.appointment.deleteMany({
      where: {
        id: {
          in: appointmentIdsToCancel,
        },
      },
    });

    //--------------- Transaction-3: Update isBooked: false in doctorSchedules database ---------------
    for (const upPaidAppointment of unpaidAppointments) {
      await tx.doctorSchedules.updateMany({
        where: {
          doctorId: upPaidAppointment.doctorId,
          scheduleId: upPaidAppointment.scheduleId,
        },
        data: {
          isBooked: false,
        },
      });
    }
  });
};

export const appointmentServices = {
  createAppointmentIntoDB,
  getMyAppointMents,
  getAllAppointmentsFromDB,
  changeAppointmentStatusIntoDB,
  cancelUnpaidAppointmentsFromDB,
};
