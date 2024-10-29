import { Prisma } from "@prisma/client";

export const baseUserFields = {
    id: true,
    email: true,
    firstname: true,
    lastname: true,
    avatar: true,
    phone: true,
    role: true,
    accountStatus: true,
} satisfies Prisma.UserSelect;

export const baseUserFieldsWithCreatedAt = {
    ...baseUserFields,
    createdAt: true,
} satisfies Prisma.UserSelect;

export const baseUserFieldsWithPassword = {
    ...baseUserFields,
    password: true,
} satisfies Prisma.UserSelect;

export const basePetsitterFields = {
    id: true,
    certificateUrl: true,
    quote: true,
    rating: true,
    location: true,
    experience: true,
    about: true,
    serviceTags: true,
    coverImages: true,
    activities: true,
    requests: true,
} satisfies Prisma.PetsitterSelect;

export const baseCustomerFields = {
    id: true,
    activities: true,
    pets: true,
} satisfies Prisma.CustomerSelect;

