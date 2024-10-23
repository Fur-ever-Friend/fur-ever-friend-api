import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AccountState, Prisma, Role, State, User } from '@prisma/client';
import { handleError, hashPassword, allowFieldUpdate } from 'src/common/utils';
import { QualificationService } from 'src/modules/qualification/qualification.service';
import { CreatePetsitterDto, CreateUserDto, SearchType, SortBy, SortOrder, UpdatePetsitterDto, UpdateUserDto, UserQueryDto } from './dto';

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
                limit = 10,
            } = query;

            const where = {
                role: {
                    not: Role.ADMIN,
                },
            }

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
                select: {
                    id: true,
                    email: true,
                    firstname: true,
                    lastname: true,
                    role: true,
                    avatar: true,
                    accountStatus: true,
                    createdAt: true,
                    customer: {
                        select: {
                            id: true,
                        }
                    },
                    petsitter: {
                        select: {
                            id: true,
                        }
                    },
                }
            });

            const total = await this.prismaService.user.count({ where });

            return {
                data: users,
                total,
                page,
                limit,
            };
        } catch (err: unknown) {
            handleError(err, 'userService.GetAllUsers');
        }
    }

    async getUserByIdWithoutCredential(userId: string) {
        try {
            const user = await this.prismaService.user.findUniqueOrThrow({
                where: {
                    id: userId,
                    accountStatus: AccountState.ACTIVE
                },
                select: {
                    id: true,
                    email: true,
                    firstname: true,
                    lastname: true,
                    phone: true,
                    role: true,
                    avatar: true,
                    createdAt: true,
                    accountStatus: true,
                },
            });
            return user;
        } catch (err: unknown) {
            handleError(err, 'userService.getUserByIdWithoutCredential');
        }
    }

    async getUserById(userId: string): Promise<Partial<User>> {
        try {
            const user = await this.prismaService.user.findUniqueOrThrow({
                where: {
                    id: userId
                },
                select: {
                    id: true,
                    email: true,
                    firstname: true,
                    lastname: true,
                    phone: true,
                    role: true,
                    avatar: true,
                    accountStatus: true,
                }
            });
            return user;
        } catch (err: unknown) {
            handleError(err, 'userService.getUserById');
        }

    }

    async getRefreshToken(userId: string): Promise<string | null> {
        try {
            const { refreshToken } = await this.prismaService.user.findUniqueOrThrow({
                where: {
                    id: userId
                },
                select: {
                    refreshToken: true
                }
            });

            return refreshToken;
        } catch (err: unknown) {
            handleError(err, 'userService.getRefreshToken');
        }
    }

    async getUserByIdWithDetails(userId: string): Promise<Partial<User>> {
        try {
            const user = await this.prismaService.user.findUniqueOrThrow({
                where: {
                    id: userId,
                },
                select: {
                    id: true,
                    email: true,
                    firstname: true,
                    lastname: true,
                    avatar: true,
                    phone: true,
                    role: true,
                    refreshToken: true,
                    accountStatus: true,
                    createdAt: true,
                    customer: {
                        select: {
                            id: true,
                            activities: true,
                            pets: true
                        }
                    },
                    petsitter: {
                        select: {
                            id: true,
                            certificateUrl: true,
                            about: true,
                            experience: true,
                            quote: true,
                            rating: true,
                            location: true,
                            serviceTags: true,
                            coverImages: true,
                            requests: true,
                            activities: true,
                        }
                    }
                },
            });

            switch (user.role) {
                case Role.CUSTOMER:
                    delete user.petsitter;
                    break;
                case Role.PETSITTER:
                    delete user.customer;
                    break;
            }

            return user;
        } catch (err: unknown) {
            handleError(err, 'userService.getUserByIdWithDetails');
        }
    }

    async getUserByEmail(email: string): Promise<Partial<User>> {
        try {
            const user = await this.prismaService.user.findUniqueOrThrow({
                where: {
                    email
                },
                select: {
                    id: true,
                    email: true,
                    firstname: true,
                    lastname: true,
                    password: true,
                    phone: true,
                    role: true,
                    avatar: true,
                    createdAt: true,
                    accountStatus: true,
                    customer: {
                        select: {
                            id: true,
                            activities: true,
                            pets: true
                        }
                    },
                    petsitter: {
                        select: {
                            id: true,
                            about: true,
                            activities: true,
                            certificateUrl: true,
                            coverImages: true,
                            experience: true,
                            location: true,
                            quote: true,
                            rating: true,
                            serviceTags: true,
                            requests: true,
                        }
                    },
                }
            });

            switch (user.role) {
                case Role.CUSTOMER:
                    delete user.petsitter;
                    break;
                case Role.PETSITTER:
                    delete user.customer;
                    break;
            }

            return user;
        } catch (err: unknown) {
            handleError(err, 'userService.getUserByEmail');
        }
    }

    async createUser({ password, role, ...rest }: CreateUserDto): Promise<Partial<User>> {
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
                select: {
                    id: true,
                    email: true,
                    firstname: true,
                    lastname: true,
                    phone: true,
                    role: true,
                    avatar: true,
                    accountStatus: true,
                }
            });

            return user;
        } catch (err: unknown) {
            handleError(err, 'userService.createUser');
        }
    }

    async createPetsitter(email: string) {
        try {
            const { id, state, certificateUrl, createdAt, ...rest } = await this.qualificationService.getQualification(email);
            if (state !== State.PENDING) throw new BadRequestException('Qualification is not pending');

            const createPetsitter = {
                ...rest,
                role: "PETSITTER"
            } satisfies CreatePetsitterDto;

            const user = await this.prismaService.$transaction(async (prisma) => {
                const user = await prisma.user.create({
                    data: {
                        ...createPetsitter,
                        petsitter: {
                            create: {
                                certificateUrl
                            }
                        }
                    },
                    select: {
                        id: true,
                        email: true,
                        firstname: true,
                        lastname: true,
                        phone: true,
                        role: true,
                        avatar: true,
                        accountStatus: true,
                    }
                });

                await this.qualificationService.updateQualification(id, State.ACCEPTED);
                return user;
            });

            return user;
        } catch (err) {
            handleError(err, 'userService.createPetsitter');
        }
    }

    async updatePetsitter(userId: string, data: UpdatePetsitterDto): Promise<Partial<User>> {
        try {
            let hashedPassword: string | undefined = undefined;
            const { petsitterData, ...otherField } = data
            const { password, ...rest } = allowFieldUpdate(['password', 'firstname', 'lastname', 'phone', 'avatar'], otherField);
            if (password) {
                hashedPassword = await hashPassword(password);
            }
            let user: Partial<User>;
            user = await this.prismaService.user.findUniqueOrThrow({
                where: { id: userId },
                select: { role: true },
            });

            if (user.role !== 'PETSITTER') throw new ForbiddenException('You do not have permission to update this user');

            user = await this.prismaService.user.update({
                where: {
                    id: userId
                },
                data: {
                    ...rest,
                    password: hashedPassword,
                    petsitter: petsitterData ? {
                        update: {
                            ...petsitterData,
                        }
                    } : undefined,
                },
                select: {
                    id: true,
                    email: true,
                    firstname: true,
                    lastname: true,
                    phone: true,
                    role: true,
                    avatar: true,
                    accountStatus: true,
                    petsitter: {
                        select: {
                            id: true,
                            certificateUrl: true,
                            about: true,
                            experience: true,
                            quote: true,
                            rating: true,
                            location: true,
                            serviceTags: true,
                            coverImages: true,
                            requests: true,
                            activities: true,
                        }
                    }
                }
            });

            return user;
        } catch (err) {
            handleError(err, 'userService.updatePetsitter');
        }
    }

    async updateUser(userId: string, data: UpdateUserDto): Promise<Partial<User>> {
        try {
            const { role, ...userData } = data
            const { password, ...otherField } = allowFieldUpdate(['password', 'firstname', 'lastname', 'phone', 'avatar'], userData);
            let hashedPassword: string | undefined = undefined;
            if (password) {
                hashedPassword = await hashPassword(password);
            }

            let user: Partial<User>;

            user = await this.prismaService.user.findUniqueOrThrow({
                where: { id: userId },
                select: { role: true },
            });

            if (user.role !== role) throw new ForbiddenException('You do not have permission to update this user');

            user = await this.prismaService.user.update({
                where: {
                    id: userId
                },
                data: {
                    ...otherField,
                    password: hashedPassword,
                },
                include: {
                    customer: role === Role.CUSTOMER,
                },
            });

            return user;
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                throw new BadRequestException('Email already exists');
            }

            throw error;
        }
    }

    async updateRefreshToken(userId: string, refreshToken: string | null): Promise<void> {
        try {
            await this.prismaService.user.update({
                where: {
                    id: userId
                },
                data: {
                    refreshToken
                }

            });
        } catch (err: unknown) {
            handleError(err, 'userService.updateRefreshToken');
        }
    }

    async setUserState(userId: string, state: AccountState): Promise<void> {
        try {
            const user = await this.prismaService.user.findUniqueOrThrow({
                where: { id: userId },
                select: { role: true }
            });

            if (user.role === "ADMIN") throw new BadRequestException("Cannot change state of admin account");

            await this.prismaService.user.update({
                where: { id: userId },
                data: {
                    accountStatus: state
                }
            });
        } catch (err: unknown) {
            handleError(err, 'userService.setUserState');
        }
    }

    async deleteUser(userId: string, isAdmin: boolean): Promise<void> {
        try {
            const user = await this.prismaService.user.findUniqueOrThrow({
                where: { id: userId },
                select: { role: true }
            });

            if (isAdmin && user.role === "ADMIN") throw new BadRequestException("Cannot delete admin account");

            await this.prismaService.user.delete({
                where: { id: userId }
            });
        } catch (err: unknown) {
            handleError(err, 'userService.deleteUser');
        }
    }

}
