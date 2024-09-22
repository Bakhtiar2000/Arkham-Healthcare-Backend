import { z } from "zod";

const createAppointmentValidationSchema = z.object({
  body: z.object({
    doctorId: z.string({
      required_error: "Doctor Id is required!",
    }),
    scheduleId: z.string({
      required_error: "Doctor schedule id is required!",
    }),
  }),
});

export const appointmentValidations = {
  createAppointmentValidationSchema,
};
