import { BadRequestException, ForbiddenException, HttpException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AccountState, Prisma, Role, State, User } from '@prisma/client';
import { hashPassword } from 'src/common/utils';
import { QualificationService } from 'src/modules/qualification/qualification.service';
import { CreatePetsitterDto } from './dto/create-petsitter.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePetsitterDto, UpdateUserDto } from './dto/update-petsitter.dto';
import { allowFieldUpdate, filterAllowedFields } from 'src/common/utils/filterAllowField';
import { SearchType, SortBy, SortOrder, UserQueryDto } from './dto/user-query-param.dto';

@Injectable()
export class UserService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly qualificationService: QualificationService,
    ) { }

    async findAllUsers(query: UserQueryDto) {
        try {
            const {
                search,
                searchType,
                sortOrder = SortOrder.ASC,
                sortBy = SortBy.ID,
                page = 1,
                limit = 5,
            } = query;

            const where = {}
            if (search && searchType) {
                switch (searchType) {
                    case SearchType.ID:
                        where['id'] = {
                            contains: search
                        }
                        break;
                    case SearchType.EMAIL:
                        where['email'] = {
                            contains: search
                        }
                    case SearchType.NAME:
                        const names = search.split(' ');
                        if (names.length === 1) {
                            where['OR'] = [
                                {
                                    firstname: {
                                        startsWith: names[0],
                                        mode: 'insensitive'
                                    }
                                },
                            ]
                        } else if (names.length === 2) {
                            where['OR'] = [
                                {
                                    firstname: {
                                        startsWith: names[0],
                                        mode: 'insensitive'
                                    },
                                    lastname: {
                                        startsWith: names[1],
                                        mode: 'insensitive'
                                    }
                                },
                            ]
                        }
                        break;
                }
            }

            const skip = (page - 1) * limit;
            const take = limit;

            const orderBy = [];
            if (sortBy === SortBy.EMAIL) {
                orderBy.push({ email: sortOrder });
            } else if (sortBy === SortBy.ROLE) {
                orderBy.push({ role: sortOrder });
            } else if (sortBy === SortBy.ACCOUNT_STATE) {
                orderBy.push({ accountStatus: sortOrder });
            } else if (sortBy === SortBy.NAME) {
                orderBy.push({ firstname: sortOrder });
                orderBy.push({ lastname: sortOrder });
            }
            orderBy.push({ id: sortOrder });

            const users = await this.prismaService.user.findMany({
                where,
                orderBy,
                skip,
                take,
                include: {
                    customer: {
                        include: {
                            pets: true
                        },
                    }, petsitter: true, admin: true
                }
            });

            const total = await this.prismaService.user.count({ where });

            return {
                data: users,
                total,
                page,
                limit,
            };
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

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

    async getUserByIdWithoutCredential(userId: string): Promise<Omit<User, 'password' | 'refreshToken' | 'accountStatus'>> {
        try {
            const user = await this.prismaService.user.findUnique({
                where: {
                    id: userId,
                    accountStatus: 'ACTIVE'
                },
                select: {
                    id: true,
                    email: true,
                    firstname: true,
                    lastname: true,
                    phone: true,
                    role: true,
                    avatar: true,
                },
            });
            if (!user) throw new NotFoundException('User not found');
            return user;
        } catch (error) {
            throw error;
        }
    }

    async getUserById(userId: string): Promise<User> {
        try {
            const user = await this.prismaService.user.findUnique({
                where: {
                    id: userId
                },
            });
            if (!user) throw new NotFoundException('User not found');
            return user;
        } catch (error) {
            throw error;
        }
    }

    async getRefreshToken(userId: string): Promise<string | null> {
        const user = await this.prismaService.user.findUnique({
            where: {
                id: userId
            },
            select: {
                refreshToken: true
            }
        });

        if (!user) throw new NotFoundException('User not found');

        return user.refreshToken;
    }

    async getUserByIdWithDetails(userId: string): Promise<User> {
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
            throw error;
        }
    }

    async getUserByEmail(email: string): Promise<User> {
        try {
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
            if (!user) throw new NotFoundException('User not found');
            return user;
        } catch (err) {
            if (err instanceof HttpException) {
                console.log(`[HttpException] Code: ${err.getStatus()} Message: ${err.message}`);
                throw err;
            } else {
                console.log("[ERROR]", err);
                throw new InternalServerErrorException()
            }
        }
    }

    async createUser({ password, role, ...rest }: CreateUserDto): Promise<User> {
        try {
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
            } else if (error instanceof HttpException) {
                console.log("HTTP EXCEPTION Error:", error.message)
                throw error
            } else {
                console.log("ERROR:", error)
                throw error;
            }
        }
    }

    async createPetsitter(email: string): Promise<User> {
        const { id, state, certificateUrl, createdAt, ...rest } = await this.qualificationService.getQualification(email);
        console.log(`[DEBUG] Qualification: ${id} ${state} ${certificateUrl}`);
        if (state !== State.PENDING) throw new BadRequestException('Qualification is not pending');
        const createPetsitter = {
            ...rest,
            role: "PETSITTER"
        } satisfies CreatePetsitterDto;
        console.log(`[DEBUG] CreatePetsitter: ${JSON.stringify(createPetsitter)}`);
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

            await this.qualificationService.updateQualification(id, State.ACCEPTED);

            return user;
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                throw new BadRequestException('Email already exists');
            }
            console.log("[ERROR]", error);
            throw error;
        }
    }

    async updatePetsitter(userId: string, data: UpdatePetsitterDto): Promise<User> {
        try {

            let hashedPassword: string | undefined = undefined;
            const { petsitterData, ...otherField } = data
            const { password, ...rest } = allowFieldUpdate(['password', 'firstname', 'lastname', 'phone', 'avatar'], otherField);
            if (password) {
                hashedPassword = await hashPassword(password);
            }
            const existingPetsitter = await this.prismaService.user.findUnique({
                where: { id: userId },
                include: { petsitter: true }
            });

            if (!existingPetsitter) throw new NotFoundException(`Petsitter with ID ${userId} not found`);

            if (existingPetsitter.role !== 'PETSITTER') throw new ForbiddenException('You do not have permission to update this user');

            const user = await this.prismaService.user.update({
                where: {
                    id: userId
                },
                data: {
                    ...otherField,
                    password: hashedPassword ? hashedPassword : undefined,
                    petsitter: petsitterData ? {
                        update: {
                            ...petsitterData,
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
            console.log("[ERROR]", error);
            throw error;
        }
    }

    async updateUser(userId: string, data: UpdateUserDto): Promise<User> {
        const { role, ...userData } = data
        // const { password, ...rest } = filterAllowedFields(userData, ['password', 'firstname', 'lastname', 'phone', 'avatar']);
        const { password, ...otherField } = allowFieldUpdate(['password', 'firstname', 'lastname', 'phone', 'avatar'], userData);
        let hashedPassword: string | undefined = undefined;
        if (password) {
            hashedPassword = await hashPassword(password);
        }

        console.log(otherField);

        const user = await this.prismaService.user.findUnique({
            where: { id: userId },
            select: { role: true },
        });

        if (!user) throw new NotFoundException('User not found');

        if (user.role !== role) throw new ForbiddenException('You do not have permission to update this user');

        try {
            const user = await this.prismaService.user.update({
                where: {
                    id: userId
                },
                data: {
                    ...otherField,
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

    async updateRefreshToken(userId: string, refreshToken: string | null) {
        return this.prismaService.user.update({
            where: {
                id: userId
            },
            data: {
                refreshToken
            }
        });
    }

    // set user status (ADMIN) /
    async setUserState(userId: string, state: AccountState): Promise<boolean> {
        const user = await this.prismaService.user.findUnique({
            where: { id: userId },
            select: { role: true }
        });
        console.log("USER:", user);
        if (!user) throw new NotFoundException('User not found');

        if (user.role === "ADMIN") throw new BadRequestException("Cannot change state of admin account");

        await this.prismaService.user.update({
            where: { id: userId },
            data: {
                accountStatus: state
            }
        });

        return true;
    }

    // delete user account (ADMIN)
    async deleteUser(userId: string, isAdmin: boolean): Promise<boolean> {
        const user = await this.prismaService.user.findUnique({
            where: { id: userId },
            select: { role: true }
        });

        if (!user) throw new NotFoundException('User not found');

        if (isAdmin && user.role === "ADMIN") throw new BadRequestException("Cannot delete admin account");

        await this.prismaService.user.delete({
            where: { id: userId }
        });

        return true;
    }
}
