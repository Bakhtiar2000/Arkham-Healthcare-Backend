import { z } from "zod";

const createSpecialtiesValidationSchema = z.object({
  title: z.string({
    required_error: "Title is required!",
  }),
});

export const SpecialtiesValidations = {
  createSpecialtiesValidationSchema,
};
