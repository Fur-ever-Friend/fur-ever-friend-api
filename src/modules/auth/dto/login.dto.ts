import { IsEmail, MaxLength, MinLength, IsEnum } from 'class-validator';


export class LoginDto {
    @IsEmail({}, { message: "Invalid email" })
    email: string;

    @MinLength(8, { message: "length must be more than 8" })
    @MaxLength(255, { message: "length must be less than 255" })
    password: string;
}
