import { Role } from '@prisma/client';
import { IsArray, IsEnum, IsOptional, IsString, Length, Matches } from 'class-validator';
import { z } from "zod";
// export class UpdatePetsitterDto {
//     @IsOptional()
//     @IsString()
//     quote: string;

//     @IsOptional()
//     @IsString()
//     location: string;

//     @IsOptional()
//     @IsString()
//     about: string;

//     @IsOptional()
//     @IsString()
//     experience: string;

//     @IsOptional()
//     @IsArray()
//     @IsString({ each: true })
//     coverImages: string[];
// }
// export class UpdateUserDto {
//     @IsOptional()
//     @IsString()
//     @Length(6)
//     password: string;

//     @IsOptional()
//     @IsString()
//     @Length(2, 30)
//     firstname: string;

//     @IsOptional()
//     @IsString()
//     @Length(2, 30)
//     lastname: string;

//     @IsOptional()
//     @IsString()
//     @Matches(/^0\d{9}$/, { message: 'Phone number must start with "0" and be 10 digits long' })
//     phone: string;

//     @IsOptional()
//     @IsString()
//     avatar: string;

//     @IsEnum(Role)
//     role: string;

//     @IsOptional()
//     petsitterData?: UpdatePetsitterDto;
// }

export const UpdatePetsitterDtoSchema = z.object({
    password: z.string().min(6).optional(),
    firstname: z.string().min(2).max(30).optional(),
    lastname: z.string().min(2).max(30).optional(),
    phone: z.string().regex(/^0\d{9}$/).optional(),
    avatar: z.string().optional(),
    petsitterData: z.object({
        quote: z.string().optional(),
        location: z.string().optional(),
        about: z.string().optional(),
        experience: z.string().optional(),
        coverImages: z.array(z.string()).optional(),
    }).optional(),
});

export type UpdatePetsitterDto = z.infer<typeof UpdatePetsitterDtoSchema>;

export const UpdateUserDtoSchema = z.object({
    password: z.string().min(6).optional(),
    firstname: z.string().min(2).max(30).optional(),
    lastname: z.string().min(2).max(30).optional(),
    phone: z.string().regex(/^0\d{9}$/).optional(),
    avatar: z.string().optional(),
    role: z.string(),
});

export type UpdateUserDto = z.infer<typeof UpdateUserDtoSchema>;