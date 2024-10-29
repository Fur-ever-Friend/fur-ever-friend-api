import { IsOptional, IsEnum, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { Role } from '@prisma/client';

export enum SearchType {
    ID = 'id',
    EMAIL = 'email',
    NAME = 'name',
}

export enum SortOrder {
    ASC = 'asc',
    DESC = 'desc',
}

export enum SortBy {
    ID = 'id',
    NAME = 'name',
    EMAIL = 'email',
    ROLE = 'role',
    ACCOUNT_STATE = 'accountStatus',
}

export class UserQueryDto {
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
    @IsEnum(Role)
    role?: Role;

    @IsOptional()
    @IsInt()
    @Type(() => Number)
    @Min(1)
    page?: number;

    @IsOptional()
    @IsInt()
    @Type(() => Number)
    @Min(1)
    limit?: number;
}
