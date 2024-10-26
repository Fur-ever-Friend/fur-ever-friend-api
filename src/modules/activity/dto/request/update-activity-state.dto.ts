import { ActivityState } from "@prisma/client";
import { IsEnum } from "class-validator";

export class UpdateActivityStateDto {
    @IsEnum(ActivityState)
    state: ActivityState;
}
