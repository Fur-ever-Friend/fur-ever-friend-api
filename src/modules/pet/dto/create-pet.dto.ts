import { z } from 'zod';
import { Gender } from '@prisma/client';

export const CreatePetSchema = z.object({
    name: z
        .string({ message: 'Name must be a string' })
        .min(1, { message: 'Name must be at least 1 character long' })
        .max(30, { message: 'Name must be at most 30 characters long' }),
    age: z
        .number({ message: 'Age must be a number' })
        .min(0, { message: 'Age must be a non-negative number' }),
    weight: z
        .number({ message: 'Weight must be a number' })
        .min(0, { message: 'Weight must be a non-negative number' }),
    gender: z.nativeEnum(Gender, { message: 'Gender must be a valid value' }),
    personality: z.string({ message: 'Personality must be a string' }).optional(),
    allergy: z.string({message: 'Allergy must be a string'}).optional(),
    otherDetail: z.string({message: 'Other Detail must be a string'}).optional(),
    animalTypeId: z.string({message: 'Animal Type ID must be a string'}).uuid({ message: 'Animal Type ID must be a valid UUID' }),
    breedId: z.string({message: "Breed ID must be a string"}).uuid({ message: 'Breed ID must be a valid UUID' }),
    imageUrl: z.string({message: "Image URL must be a string"}).optional(),
});

export type CreatePetDto = z.infer<typeof CreatePetSchema>;
