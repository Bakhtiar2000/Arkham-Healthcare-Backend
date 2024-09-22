import { TAuthUser } from "../../interfaces/authUser.type";
import prisma from "../../shared/prisma";
import { v4 as uuidV4 } from "uuid";

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
      today.getMinutes();
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

export const appointmentServices = {
  createAppointmentIntoDB,
};
