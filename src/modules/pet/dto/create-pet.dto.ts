import { z } from 'zod';
import { Gender } from '@prisma/client';

export const CreatePetSchema = z.object({
    name: z.string().min(1).max(30),
    age: z.number(),
    weight: z.number(),
    gender: z.enum([Gender.MALE, Gender.FEMALE]),
    personality: z.string().optional(),
    allergy: z.string().optional(),
    otherDetail: z.string().optional(),
    animalTypeId: z.string().uuid(),
    breedId: z.string().uuid(),
    imageUrl: z.string().optional(),
});

export type CreatePetDto = z.infer<typeof CreatePetSchema>;
