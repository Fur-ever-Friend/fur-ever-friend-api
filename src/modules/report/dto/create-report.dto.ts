import { z } from "zod";
import { ReportType } from "@prisma/client";

export const CreateReportSchema = z.object({
  type: z.nativeEnum(ReportType, {
    invalid_type_error: "Report type must be one of the specified enum values.",
    required_error: "Report type is required.",
    message: "Report type must be a valid enum value.",
  }),
  content: z.string({message: "Content must be a string."})
    .min(1, { message: "Content must be at least 1 character long." })
    .max(255, { message: "Content must be at most 255 characters long." }),
  reporterId: z.string({ message: "Reporter ID is required." })
    .uuid({ message: "Reporter ID invalid." }),
  reportedId: z.string({ message: "Reported ID is required." })
    .uuid({ message: "Reported ID invalid." }),
});

export type CreateReportDto = z.infer<typeof CreateReportSchema>;
