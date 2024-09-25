import { z } from "zod";

export const QualificationSchema = z.object({
    email: z
        .string()
        .email({ message: "Invalid email" })
        .max(30, { message: "Length must be less than 30" }),
    
    password: z
        .string()
        .min(8, { message: "Length must be more than 8" })
        .max(255, { message: "Length must be less than 255" }),
    
    firstname: z
        .string()
        .min(3, { message: "Length must be more than 3" })
        .max(30, { message: "Length must be less than 30" }),
    
    lastname: z
        .string()
        .min(3, { message: "Length must be more than 3" })
        .max(30, { message: "Length must be less than 30" }),
    
    phone: z
        .string()
        .regex(/0\d{9}$/, { message: "Phone number is not valid" }),
});

export type QualificationDto = z.infer<typeof QualificationSchema>;