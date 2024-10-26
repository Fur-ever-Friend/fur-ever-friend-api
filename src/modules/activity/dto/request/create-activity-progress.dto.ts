import { IsNotEmpty, IsString } from 'class-validator';
import { z } from "zod";
export class CreateActivityProgressDto {
  @IsNotEmpty()
  @IsString()
  activityServiceId: string;

  @IsNotEmpty()
  @IsString()
  content: string;
}

export const CreateProgressSchema = z.object({
  content: z.string().min(1, "Content is required"),
}).required({ content: true });

export type CreateProgressDto = z.infer<typeof CreateProgressSchema>;
