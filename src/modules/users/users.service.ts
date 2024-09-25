import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Role, User } from '@prisma/client';
import { hashPassword } from 'src/utils';
import { QualificationService } from 'src/modules/qualification/qualification.service';
import { CreatePetsitterDto } from './dto/create-petsitter.dto';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly qualificationService: QualificationService,
    ) { }

    async getUsers(): Promise<User[]> {
        return this.prismaService.user.findMany({
            include: { customer: true, petsitter: true, admin: true },
        });
    }

    async getUserById(userId: string): Promise<User> {
        try {
            const user = await this.prismaService.user.findUnique({
                where: {
                    id: userId
                },
                include: { customer: true, petsitter: true, admin: true },
            });
            return user;
        } catch (error) {
            console.log("[ERROR]", error);
            throw error;
        }
    }

    async getUserByEmail(email: string): Promise<User> {
        const user = await this.prismaService.user.findUnique({
            where: {
                email
            },
            include: { customer: true, petsitter: true, admin: true },
        });

        return user;
    }

    async getUsersByRole(role: Role): Promise<User[]> {
        const users = await this.prismaService.user.findMany({
            where: {
                role
            },
            include: { customer: true, petsitter: true, admin: true },
        })

        return users;
    }

    async createUser({ password, role, ...rest }: CreateUserDto): Promise<User> {
        const hashedPassword = await hashPassword(password);

        let roleData = {};

        switch (role) {
            case 'CUSTOMER':
                roleData = { customer: { create: {} } };
                break;
            case 'ADMIN':
                roleData = { admin: { create: {} } };
                break;
            default:
                throw new BadRequestException("Invalid role");
        }

        try {
            const user = await this.prismaService.user.create({
                data: {
                    password: hashedPassword,
                    role,
                    ...rest,
                    ...roleData
                },
                include: {
                    customer: role === "CUSTOMER" ? true : false,
                    admin: role === "ADMIN" ? true : false,
                }
            });

            return user;
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                // P2002 is the code for unique constraint violation
                throw new BadRequestException('Email already exists');
            }

            throw error;
        }
    }

    async createPetsitter(email: string): Promise<User> {
        const { id, state, certificateUrl, ...rest } = await this.qualificationService.getQualification(email);

        const createPetsitter = {
            ...rest,
            role: "PETSITTER"
        } satisfies CreatePetsitterDto;

        try {
            const user = await this.prismaService.user.create({
                data: {
                    ...createPetsitter,
                    petsitter: {
                        create: {
                            certificateUrl
                        }
                    }
                },
                include: {
                    petsitter: true,
                }
            })

            return user;
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                // P2002 is the code for unique constraint violation
                throw new BadRequestException('Email already exists');
            }

            throw error;
        }

    }
}
