import { UserRole } from "@prisma/client";
import { TAuthUser } from "../../interfaces/authUser.type";
import prisma from "../../shared/prisma";

const fetchDashboardMetaDataFromDB = async (user: TAuthUser) => {
  let metaData;
  switch (user?.role) {
    case UserRole.SUPER_ADMIN:
      getSuperAdminMetaData();
      break;
    case UserRole.ADMIN:
      getAdminMetaData();
      break;
    case UserRole.DOCTOR:
      getDoctorMetaData(user as TAuthUser);
      break;
    case UserRole.PATIENT:
      getPatientMetaData();
      break;

    default:
      throw new Error("Invalid User Role");
  }
};

// ____________SUPER_ADMIN____________
const getSuperAdminMetaData = async () => {
  console.log("Super Admin");
};

// ____________ADMIN____________
const getAdminMetaData = async () => {
  const appointmentCount = await prisma.appointment.count();
  const patientCount = await prisma.patient.count();
  const doctorCount = await prisma.doctor.count();
  const paymentCount = await prisma.payment.count();
  const totalRevenueCount = await prisma.payment.aggregate({
    _sum: { amount: true },
  });

  return {
    appointmentCount,
    patientCount,
    doctorCount,
    paymentCount,
    totalRevenueCount,
  };
};

// ____________DOCTOR____________
const getDoctorMetaData = async (user: TAuthUser) => {
  const doctorData = await prisma.patient.findUniqueOrThrow({
    where: {
      email: user?.email,
    },
  });

  const appointmentCount = await prisma.appointment.count({
    where: {
      doctorId: doctorData.id,
    },
  });
  const patientCount = await prisma.appointment.groupBy({
    by: ["patientId"],
    _count: {
      id: true,
    },
  });

  const reviewCount = await prisma.review.count({
    where: {
      doctorId: doctorData.id,
    },
  });

  const totalRevenueCount = await prisma.payment.aggregate({
    where: {
      appointment: {
        doctorId: doctorData.id,
      },
    },
    _sum: {
      amount: true,
    },
  });

  const statusBasedAppointmentCount = (
    await prisma.appointment.groupBy({
      by: ["status"],
      _count: {
        id: true,
      },
      where: {
        doctorId: doctorData.id,
      },
    })
  ) // Original data:
    //[{ count: {id: 5}, status: "COMPLETED" },{ count: {id: 3}, status: "SCHEDULED" }]
    .map(({ status, _count }) => ({
      status: status,
      count: Number(_count.id),
    })); // Formatted data:
  //[{ status: "COMPLETED", count: 5 }, { status: "SCHEDULED", count: 3 }]

  return {
    appointmentCount,
    patientCount,
    reviewCount,
    totalRevenueCount,
    statusBasedAppointmentCount,
  };
};

// ____________PATIENT____________
const getPatientMetaData = async () => {
  console.log("Patient");
};

export const metaServices = {
  fetchDashboardMetaDataFromDB,
};
