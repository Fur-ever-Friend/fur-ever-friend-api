import { Role } from '@prisma/client';
import { IsEnum, IsOptional, IsString, Length, Matches } from 'class-validator';

export class UpdateUserDto {
    @IsOptional()
    @IsString()
    @Length(6)
    password: string;

    @IsOptional()
    @IsString()
    @Length(2, 30)
    firstname: string;

    @IsOptional()
    @IsString()
    @Length(2, 30)
    lastname: string;

    @IsOptional()
    @IsString()
    @Matches(/^0\d{9}$/, { message: 'Phone number must start with "0" and be 10 digits long' })
    phone: string;
}


export class UpdatePetsitterDto extends UpdateUserDto {
    @IsOptional()
    @IsString()
    information: string;
}

export class UpdateUserWithRoleDto {
    @IsOptional()
    petsitterData?: UpdatePetsitterDto;

    @IsEnum(Role)
    role: string;

    @IsOptional()
    userData?: UpdateUserDto;
}