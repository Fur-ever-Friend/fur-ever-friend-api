import { Role } from "@prisma/client";
import { IsEmail, IsEnum, IsPhoneNumber, MaxLength, MinLength } from "class-validator";

export class CreatePetsitterDto {
    @IsEmail({}, { message: "Invalid email" })
    @MaxLength(30, { message: "length must be less than 30" })
    email: string;

    @MinLength(8, { message: "length must be more than 8" })
    @MaxLength(255, { message: "length must be less than 255" })
    password: string;

    @MinLength(3, { message: "length must be more than 3" })
    @MaxLength(30, { message: "length must be less than 30" })
    firstname: string;

    @MinLength(3, { message: "length must be more than 3" })
    @MaxLength(30, { message: "length must be less than 30" })
    lastname: string;

    @IsEnum(Role)
    role: Role;

    @IsPhoneNumber("TH", { message: "phone number is not valid" })
    phone: string

}
