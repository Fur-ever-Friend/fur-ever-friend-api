import { Role, ServiceType } from '@prisma/client';
import { z } from "zod";

const animalTypes = ['Dog', 'Cat', 'Rabbit', 'Hamster', 'Bird', 'Fish', 'Reptile', 'Other'] as const;

export const UpdatePetsitterDtoSchema = z.object({
    password: z.string().min(6).optional(),
    firstname: z.string().min(1).max(30).optional(),
    lastname: z.string().min(1).max(30).optional(),
    phone: z.string().regex(/^0\d{9}$/).optional(),
    avatar: z.string().optional(),
    petsitterData: z.object({
        quote: z.string().optional(),
        location: z.string().optional(),
        about: z.string().optional(),
        experience: z.string().optional(),
        coverImages: z.array(z.string()).optional(),
        serviceTags: z.nativeEnum(ServiceType).array().optional(),
        petTags: z.enum(animalTypes).array().optional(),
    }).optional(),
});

export type UpdatePetsitterDto = z.infer<typeof UpdatePetsitterDtoSchema>;

export const UpdateUserDtoSchema = z.object({
    password: z.string().min(6).optional(),
    firstname: z.string().min(1).max(30).optional(),
    lastname: z.string().min(1).max(30).optional(),
    phone: z.string().regex(/^0\d{9}$/).optional(),
    avatar: z.string().optional(),
    role: z.nativeEnum(Role),
});

export type UpdateUserDto = z.infer<typeof UpdateUserDtoSchema>;

export const UpdateCustomerSchema = z.object({
    password: z.string().min(6).optional(),
    firstname: z.string().min(1).max(30).optional(),
    lastname: z.string().min(1).max(30).optional(),
    phone: z.string().regex(/^0\d{9}$/).optional(),
    avatar: z.string().optional(),
});

export type UpdateCustomerDto = z.infer<typeof UpdateCustomerSchema>;
