import { z } from "zod";
import { ReportType } from "@prisma/client";
export const CreateReportSchema = z.object({
    type: z.nativeEnum(ReportType),
    content: z.string().min(1).max(255),
    reporterId: z.string().uuid(),
    reportedId: z.string().uuid(),
})

export type CreateReportDto = z.infer<typeof CreateReportSchema>