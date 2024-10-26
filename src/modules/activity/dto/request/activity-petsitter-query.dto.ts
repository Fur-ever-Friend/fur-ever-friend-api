import { ActivityState } from "@prisma/client";
import { Type } from "class-transformer";
import { IsEnum, IsOptional, Min } from "class-validator";

export class ActivityPetsitterQueryDto {
    @IsOptional()
    @IsEnum(ActivityState)
    state?: ActivityState;

    @IsOptional()
    @Type(() => Number)
    @Min(1)
    page?: number;

    @IsOptional()
    @Type(() => Number)
    @Min(1)
    limit?: number;
}