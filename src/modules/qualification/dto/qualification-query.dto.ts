import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsString, Min } from "class-validator";
import { SearchType, SortBy, SortOrder } from "src/modules/user/dto/user-query-param.dto";

export class QualificationQueryDto {
    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsEnum(SearchType)
    searchType?: SearchType;

    @IsOptional()
    @IsString()
    sortBy?: SortBy;

    @IsOptional()
    @IsString()
    sortOrder?: SortOrder;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    limit?: number;
}