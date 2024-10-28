import { z } from 'zod';
import { Gender } from '@prisma/client';

export const UpdatePetSchema = z.object({
    name: z.string()
        .min(1, { message: 'Name must be at least 1 character long' })
        .max(30, { message: 'Name must be at most 30 characters long' })
        .optional(),

    age: z.number()
        .min(0, { message: 'Age must be a non-negative number' })
        .optional(),

    weight: z.number()
        .min(0, { message: 'Weight must be a non-negative number' })
        .optional(),

    gender: z.enum([Gender.MALE, Gender.FEMALE], { message: 'Gender must be a valid value' }).optional(),

    personality: z.string()
        .optional(),

    allergy: z.string()
        .optional(),

    otherDetail: z.string()
        .optional(),

    animalTypeId: z.string()
        .uuid({ message: 'Animal Type ID must be a valid UUID' })
        .optional(),

    breedId: z.string()
        .uuid({ message: 'Breed ID must be a valid UUID' })
        .optional(),

    imageUrl: z.string()
        .optional(),
});

export type UpdatePetDto = z.infer<typeof UpdatePetSchema>;
