import z from "zod";

export const LoginSchema = z.object({
    email: z.string({ message: "email must be a string" }).email("Invalid email format"),
    password: z.string({ message: "password must be a string"}).min(6).max(255),
});

export type LoginDto = z.infer<typeof LoginSchema>;