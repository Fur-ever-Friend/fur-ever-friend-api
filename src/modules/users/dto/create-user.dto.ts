import { Role } from "@prisma/client";
import { IsEmail, IsEnum, IsOptional, IsPhoneNumber, IsString, Length, Matches, MaxLength, MinLength } from "class-validator";

export class CreateUserDto {
    @IsEmail({}, { message: "Invalid email" })
    @Length(5, 255, { message: "length must be between 5 and 255" })
    email: string;

    @IsString()
    @MinLength(6, { message: "length must be more than 6" })
    password: string;

    @IsOptional()
    @IsString()
    @Length(3, 30, { message: "length must be between 3 and 30" })
    firstname: string;

    @IsOptional()
    @Length(3, 30, { message: "length must be between 3 and 30" })
    lastname: string;

    @IsOptional()
    @Matches(/0\d{9}/, { message: "Invalid phone number" })
    phone: string

    @IsEnum(Role, { message: "Invalid role" })
    role: Role

    @IsOptional()
    @IsString()
    certificateUrl: string

}
