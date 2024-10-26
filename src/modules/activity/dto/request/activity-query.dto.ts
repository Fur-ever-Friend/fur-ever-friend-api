import { ServiceType } from "@prisma/client";
import { Type } from "class-transformer";
import { IsDate, IsEnum, IsOptional, IsUUID, Min } from "class-validator";

export class ActivityQueryDto {
    @IsOptional()
    @IsUUID("4", { message: "Invalid animal id" })
    animalTypeId?: string;

    @IsOptional()
    @IsEnum(ServiceType)
    serviceType?: ServiceType;

    @IsOptional()
    @Type(() => Date)
    @IsDate()
    startDate?: Date;

    @IsOptional()
    @Type(() => Date)
    @IsDate()
    endDate?: Date;

    @IsOptional()
    @Type(() => Number)
    @Min(1)
    page?: number;

    @IsOptional()
    @Type(() => Number)
    @Min(1)
    limit?: number;
}
