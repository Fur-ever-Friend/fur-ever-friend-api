import { ReportType } from "@prisma/client";
import { Type } from "class-transformer";
import { IsDate, IsEnum, IsOptional, Min } from "class-validator";

export class ReportQueryDto {
    @IsOptional()
    @IsEnum(ReportType)
    type?: ReportType;

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
