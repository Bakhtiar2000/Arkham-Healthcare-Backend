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

  const result = await prisma.appointment.create({
    data: {
      patientId: patientData.id,
      doctorId,
      scheduleId,
      videoCallingId,
    },
    include: {
      patient: true,
      doctor: true,
      schedule: true,
    },
  });

  return result;
};

export const appointmentServices = {
  createAppointmentIntoDB,
};
