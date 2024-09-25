import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Role, User } from '@prisma/client';
import { hashPassword } from 'src/utils';
import { QualificationService } from 'src/modules/qualification/qualification.service';
import { CreatePetsitterDto } from './dto/create-petsitter.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePetsitterDto, UpdateUserWithRoleDto } from './dto/update-petsitter.dto';
import { filterAllowedFields } from 'src/utils/filterAllowField';

@Injectable()
export class UserService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly qualificationService: QualificationService,
    ) { }

    async getUsers(): Promise<User[]> {
        return this.prismaService.user.findMany({
            include: {
                customer: {
                    include: {
                        pets: true
                    },
                }, petsitter: true, admin: true
            },
        });
    }

    async getUserById(userId: string): Promise<User> {
        try {
            const user = await this.prismaService.user.findUnique({
                where: {
                    id: userId
                },
                include: {
                    customer: {
                        include: {
                            pets: true
                        },
                    }, petsitter: true, admin: true
                },
            });
            if (!user) throw new NotFoundException('User not found');
            return user;
        } catch (error) {
            if (error instanceof Error) {
                console.log("[ERROR]", error.message);
            } else {
                console.log("[ERROR]", error);
            }
            throw error;
        }
    }

    async getUserByEmail(email: string): Promise<User> {
        const user = await this.prismaService.user.findUnique({
            where: {
                email
            },
            include: {
                customer: {
                    include: {
                        pets: true
                    },
                }, petsitter: true, admin: true
            },
        });

        return user;
    }

    async getUsersByRole(role: string): Promise<User[]> {
        if (role === "ALL") return this.getUsers();
        if (!['CUSTOMER', 'PETSITTER', 'ADMIN'].includes(role)) throw new BadRequestException("Invalid role");
        const users = await this.prismaService.user.findMany({
            where: {
                role: role as Role
            },
            include: {
                customer: {
                    include: {
                        pets: true
                    },
                }, petsitter: true, admin: true
            },
        })

        return users;
    }

    async createUser(role: string, { password, ...rest }: CreateUserDto): Promise<User> {
        if (!['CUSTOMER', 'ADMIN'].includes(role)) throw new BadRequestException("Invalid role");
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
                throw new BadRequestException('Email already exists');
            }

            throw error;
        }
    }

    async updatePetsitter(userId: string, data: UpdatePetsitterDto): Promise<User> {
        let hashedPassword: string | undefined = undefined;

        const { password, information, ...rest } = filterAllowedFields(data, ['password', 'firstname', 'lastname', 'phone', 'information']);
        if (password) {
            hashedPassword = await hashPassword(password);
        }
        console.log(rest);

        const existingPetsitter = await this.prismaService.user.findUnique({
            where: { id: userId },
            include: { petsitter: true }
        });

        if (!existingPetsitter) throw new NotFoundException(`Petsitter with ID ${userId} not found`);

        if (existingPetsitter.role !== 'PETSITTER') throw new ForbiddenException('You do not have permission to update this user');

        try {
            const user = await this.prismaService.user.update({
                where: {
                    id: userId
                },
                data: {
                    ...rest,
                    password: hashedPassword ? hashedPassword : undefined,
                    petsitter: information ? {
                        update: {
                            information
                        }
                    } : undefined,
                },
                include: {
                    petsitter: true
                }
            });

            return user;
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                throw new BadRequestException('Email already exists');
            }

            throw error;
        }
    }

    async updateUser(userId: string, data: UpdateUserWithRoleDto): Promise<User> {
        const { role, userData } = data
        const { password, ...rest } = filterAllowedFields(userData, ['password', 'firstname', 'lastname', 'phone']);
        let hashedPassword: string | undefined = undefined;
        if (password) {
            hashedPassword = await hashPassword(password);
        }

        console.log(rest);

        const user = await this.prismaService.user.findUnique({
            where: { id: userId },
            select: { role: true },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (user.role !== role) {
            throw new ForbiddenException('You do not have permission to update this user');
        }

        try {
            const user = await this.prismaService.user.update({
                where: {
                    id: userId
                },
                data: {
                    ...rest,
                    password: hashedPassword ? hashedPassword : undefined,
                },
                include: {
                    customer: role === "CUSTOMER" ? true : false,
                    admin: role === "ADMIN" ? true : false,
                }
            });

            return user;
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                throw new BadRequestException('Email already exists');
            }

            throw error;
        }
    }

}
