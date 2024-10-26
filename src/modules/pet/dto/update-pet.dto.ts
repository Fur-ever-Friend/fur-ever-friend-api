import { z } from 'zod';
import { Gender } from '@prisma/client';

export const UpdatePetSchema = z.object({
    name: z.string().min(1).max(30).optional(),
    age: z.number().optional(),
    weight: z.number().optional(),
    gender: z.enum([Gender.MALE, Gender.FEMALE]).optional(),
    personality: z.string().optional(),
    allergy: z.string().optional(),
    otherDetail: z.string().optional(),
    animalTypeId: z.string().uuid().optional(),
    breedId: z.string().uuid().optional(),
    imageUrl: z.string().optional(),
});

export type UpdatePetDto = z.infer<typeof UpdatePetSchema>;