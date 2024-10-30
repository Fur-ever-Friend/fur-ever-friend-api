import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AccountState, Customer, Petsitter, Prisma, Role, State, User } from '@prisma/client';
import { handleError, hashPassword, allowFieldUpdate } from 'src/common/utils';
import { QualificationService } from 'src/modules/qualification/qualification.service';
import { CreatePetsitterDto, CreateUserDto, SearchType, SortBy, SortOrder, UpdateCustomerDto, UpdatePetsitterDto, UpdateUserDto, UserQueryDto } from './dto';
import { PetsitterQueryDto } from './dto/petsitter-query-param.dto';

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
                role,
                accountState,
                page = 1,
                limit = 10,
            } = query;

            const where = {} as Prisma.UserWhereInput;

            if (role) {
                where['role'] = role;
            } else {
                where['role'] = {
                    not: Role.ADMIN
                }
            }

            if (accountState) {
                where['accountStatus'] = accountState;
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
                    phone: true,
                    reportedList: {
                        select: {
                            id: true,
                            type: true,
                            content: true,
                            reportImages: true,
                            createdAt: true,
                            reporter: {
                                select: {
                                    id: true,
                                    email: true,
                                    firstname: true,
                                    lastname: true,
                                    avatar: true,
                                    role: true,
                                },
                            },
                            reported: {
                                select: {
                                    id: true,
                                    email: true,
                                    firstname: true,
                                    lastname: true,
                                    avatar: true,
                                    role: true,
                                },
                            }
                        }
                    }
                },
            });

            const total = await this.prismaService.user.count({ where });

            return {
                data: users,
                total,
                totolPages: Math.ceil(total / limit),
                currentPage: page,
            };
        } catch (err: unknown) {
            handleError(err, 'userService.GetAllUsers', 'users');
        }
    }

    async getUserByIdWithoutCredential(userId: string) {
        const user = await this.prismaService.user.findUnique({
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
                accountStatus: true,
                createdAt: true,
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
                        petTags: true,
                        coverImages: true,
                        reviews: {
                            select: {
                                id: true,
                                content: true,
                                rating: true,
                                createdAt: true,
                                activityId: true,
                                customer: {
                                    select: {
                                        id: true,
                                        user: {
                                            select: {
                                                id: true,
                                                firstname: true,
                                                lastname: true,
                                                avatar: true,
                                                email: true,
                                            }
                                        }
                                    }
                                }
                            },
                        },
                    }
                },
                customer: {
                    select: {
                        id: true,
                        activities: true,
                        pets: {
                            select: {
                                id: true,
                                name: true,
                                age: true,
                                imageUrl: true,
                                gender: true,
                                weight: true,
                                allergy: true,
                                personality: true,
                                otherDetail: true,
                                animalType: {
                                    select: {
                                        id: true,
                                        name: true,
                                    }
                                },
                                breed: {
                                    select: {
                                        id: true,
                                        name: true,
                                        animalType: {
                                            select: {
                                                id: true,
                                                name: true,
                                            }
                                        }
                                    }
                                },
                            },
                        }
                    }
                },
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

        if (!user) throw new NotFoundException("User not found");

        return user;
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
            handleError(err, 'userService.getRefreshToken', 'refresh token');
        }
    }

    async getUserByIdWithDetails(userId: string): Promise<Partial<User>> {
        const user = await this.prismaService.user.findUnique({
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
                        pets: true,
                        favourites: {
                            select: {
                                id: true,
                                petsitter: {
                                    select: {
                                        id: true,
                                        about: true,
                                        experience: true,
                                        quote: true,
                                        rating: true,
                                        location: true,
                                        serviceTags: true,
                                        coverImages: true,
                                        user: {
                                            select: {
                                                id: true,
                                                firstname: true,
                                                lastname: true,
                                                avatar: true,
                                                email: true,
                                                phone: true,
                                                role: true,
                                                accountStatus: true,
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
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
                        petTags: true,
                        coverImages: true,
                        activities: true,
                        reviews: {
                            select: {
                                id: true,
                                createdAt: true,
                                content: true,
                                rating: true,
                                activityId: true,
                                customer: {
                                    select: {
                                        id: true,
                                        user: {
                                            select: {
                                                id: true,
                                                firstname: true,
                                                lastname: true,
                                                avatar: true,
                                                email: true,
                                            }
                                        }
                                    }
                                }
                            }
                        },
                    }
                }
            },
        });

        if (!user) throw new NotFoundException("User not found");

        switch (user.role) {
            case Role.CUSTOMER:
                delete user.petsitter;
                break;
            case Role.PETSITTER:
                delete user.customer;
                break;
        }

        return user;
    }

    async getUserByEmail(email: string): Promise<Partial<User>> {
        const user = await this.prismaService.user.findUnique({
            where: {
                email,
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
                accountStatus: true,
                customer: {
                    select: {
                        id: true,
                        activities: true,
                        pets: {
                            select: {
                                id: true,
                                name: true,
                                age: true,
                                allergy: true,
                                gender: true,
                                imageUrl: true,
                                weight: true,
                                personality: true,
                                otherDetail: true,
                                breed: {
                                    select: {
                                        id: true,
                                        name: true,
                                        animalType: {
                                            select: {
                                                id: true,
                                                name: true,
                                            }
                                        }
                                    }
                                },
                            }
                        },
                        favourites: {
                            select: {
                                id: true,
                                petsitter: {
                                    select: {
                                        id: true,
                                        about: true,
                                        experience: true,
                                        quote: true,
                                        rating: true,
                                        location: true,
                                        serviceTags: true,
                                        petTags: true,
                                        coverImages: true,
                                        user: {
                                            select: {
                                                id: true,
                                                firstname: true,
                                                lastname: true,
                                                avatar: true,
                                                email: true,
                                                phone: true,
                                                role: true,
                                                accountStatus: true,
                                            }
                                        }
                                    }
                                }
                            }
                        }
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
                        petTags: true,
                        reviews: {
                            select: {
                                id: true,
                                content: true,
                                rating: true,
                                createdAt: true,
                                activityId: true,
                                customer: {
                                    select: {
                                        id: true,
                                        user: {
                                            select: {
                                                id: true,
                                                firstname: true,
                                                lastname: true,
                                                avatar: true,
                                                email: true,
                                            }
                                        }
                                    }
                                }
                            }
                        },
                    }
                },
            }
        });

        if (!user) throw new NotFoundException("User not found");

        switch (user.role) {
            case Role.CUSTOMER:
                delete user.petsitter;
                break;
            case Role.PETSITTER:
                delete user.customer;
                break;
            case Role.ADMIN:
                delete user.customer;
                delete user.petsitter;
                break;
        }

        return user;
    }

    async getUserByCustomerId(customerId: string): Promise<Partial<Customer>> {
        const user = await this.prismaService.customer.findUnique({
            where: { id: customerId },
            select: {
                id: true,
                user: {
                    select: {
                        id: true,
                        email: true,
                        firstname: true,
                        lastname: true,
                        phone: true,
                        role: true,
                        avatar: true,
                        accountStatus: true,
                    },
                },
            },
        })

        if (!user) throw new NotFoundException("Customer not found");

        return user;

    }

    async getUserByPetsitterId(petsitterId: string): Promise<Partial<Petsitter>> {
        const user = await this.prismaService.petsitter.findUnique({
            where: { id: petsitterId },
            select: {
                id: true,
                user: {
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
                }
            }
        });

        if (!user) throw new NotFoundException("Petsitter not found");
        return user;
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
            handleError(err, 'userService.createUser', 'user');
        }
    }

    async createPetsitter(email: string) {
        try {
            const { id, state, certificateUrl, createdAt, ...rest } = await this.qualificationService.getQualification(email);
            if (state !== State.PENDING) throw new BadRequestException('Qualification is not pending');

            const createPetsitter = {
                ...rest,
                role: Role.PETSITTER,
            } as CreatePetsitterDto;

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
            handleError(err, 'userService.createPetsitter', 'user');
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
            const { role: userRole } = await this.prismaService.user.findUniqueOrThrow({
                where: { id: userId },
                select: { role: true },
            });

            if (userRole !== 'PETSITTER') throw new ForbiddenException('You do not have permission to update this user');

            const user = await this.prismaService.user.update({
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
                    createdAt: true,
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
                            petTags: true,
                            coverImages: true,
                            reviews: {
                                select: {
                                    id: true,
                                    content: true,
                                    rating: true,
                                    createdAt: true,
                                    activityId: true,
                                    customer: {
                                        select: {
                                            id: true,
                                            user: {
                                                select: {
                                                    id: true,
                                                    firstname: true,
                                                    lastname: true,
                                                    avatar: true,
                                                    email: true,
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });

            return user;
        } catch (err) {
            handleError(err, 'userService.updatePetsitter', 'user');
        }
    }

    async findAllPetsitters(queryParams: PetsitterQueryDto) {
        const { search, page = 1, limit = 10 } = queryParams;

        const skip = (page - 1) * limit;
        const take = limit;

        const where = {
            accountStatus: AccountState.ACTIVE,
            role: Role.PETSITTER,
        } as Prisma.UserWhereInput;

        if (search) {
            const names = search.split(' ');
            if (names.length === 1) {
                where['OR'] = [
                    {
                        firstname: {
                            startsWith: names[0],
                            mode: 'insensitive'
                        }
                    },
                    {
                        lastname: {
                            startsWith: names[0],
                            mode: 'insensitive'
                        }
                    }
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
        }
        const petsitters = await this.prismaService.user.findMany({
            where: {
                role: Role.PETSITTER,
                accountStatus: AccountState.ACTIVE,
                ...where
            },
            select: {
                id: true,
                email: true,
                firstname: true,
                lastname: true,
                phone: true,
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
                        petTags: true,
                        coverImages: true,
                        reviews: {
                            select: {
                                id: true,
                                content: true,
                                rating: true,
                                createdAt: true,
                                activityId: true,
                                customer: {
                                    select: {
                                        id: true,
                                        user: {
                                            select: {
                                                id: true,
                                                firstname: true,
                                                lastname: true,
                                                avatar: true,
                                                email: true,
                                            }
                                        }
                                    }
                                }
                            }
                        },
                    }
                }
            },
            skip,
            take,
        });

        const total = await this.prismaService.user.count({ where });

        return {
            data: petsitters,
            total,
            totalPage: Math.ceil(total / limit),
            currentPage: page,
        };

    }

    async updateUser(userId: string, data: UpdateUserDto): Promise<Partial<User>> {
        const { role, ...userData } = data
        const { password, ...otherField } = allowFieldUpdate(['password', 'firstname', 'lastname', 'phone', 'avatar'], userData);
        let hashedPassword: string | undefined = undefined;
        if (password) {
            hashedPassword = await hashPassword(password);
        }

        const { role: userRole } = await this.prismaService.user.findUnique({
            where: { id: userId },
            select: { role: true },
        });

        if (!userRole) throw new NotFoundException('User not found');

        if (userRole !== role) throw new ForbiddenException('You do not have permission to update this user');

        const user = await this.prismaService.user.update({
            where: {
                id: userId
            },
            data: {
                ...otherField,
                password: hashedPassword,
            },
            include: {
                customer: userRole === Role.CUSTOMER,
            },
        });

        return user;
    }

    async updateCustomer(userId: string, data: UpdateCustomerDto): Promise<Partial<User>> {
        const { password, ...otherField } = allowFieldUpdate(['password', 'firstname', 'lastname', 'phone', 'avatar'], data);
        let hashedPassword: string | undefined = undefined;
        if (password) {
            hashedPassword = await hashPassword(password);
        }

        const user = await this.prismaService.user.update({
            where: {
                id: userId,
            },
            data: {
                ...otherField,
                password: hashedPassword,
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
                customer: {
                    select: {
                        id: true,
                        activities: true,
                        pets: {
                            select: {
                                id: true,
                                name: true,
                                age: true,
                                gender: true,
                                allergy: true,
                                imageUrl: true,
                                personality: true,
                                animalType: {
                                    select: {
                                        id: true,
                                        name: true,
                                    }
                                },
                                breed: {
                                    select: {
                                        id: true,
                                        name: true,
                                        animalType: {
                                            select: {
                                                id: true,
                                                name: true,
                                            }
                                        }
                                    }
                                },
                            }
                        }
                    },
                },
            }
        });

        return user;
    }

    async updateRefreshToken(userId: string, refreshToken: string | null): Promise<void> {
        const user = await this.prismaService.user.findUnique({
            where: {
                id: userId
            },
            select: { role: true }
        });

        if (!user) throw new NotFoundException("User not found");

        await this.prismaService.user.update({
            where: {
                id: userId
            },
            data: {
                refreshToken
            }
        });
    }

    async setUserState(userId: string, state: AccountState): Promise<void> {
        const user = await this.prismaService.user.findUnique({
            where: { id: userId },
            select: { role: true }
        });

        if (!user) throw new NotFoundException("User not found");

        if (user.role === "ADMIN") throw new BadRequestException("Cannot change state of admin account");

        await this.prismaService.user.update({
            where: { id: userId },
            data: {
                accountStatus: state
            }
        });
    }

    async deleteUser(userId: string, isAdmin: boolean): Promise<void> {
        const user = await this.prismaService.user.findUnique({
            where: { id: userId },
            select: { role: true }
        });

        if (!user) throw new NotFoundException("User not found");

        if (isAdmin && user.role === "ADMIN") throw new BadRequestException("Cannot delete admin account");

        await this.prismaService.user.delete({
            where: { id: userId }
        });
    }

    async updatePetsitterRating(petsitterId: string) {
        const reviews = await this.prismaService.review.findMany({
            where: { petsitterId },
        });

        const reports = await this.prismaService.report.findMany({
            where: { reportedId: petsitterId },
        });

        const totalReviews = reviews.length;
        const totalReports = reports.length;

        const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / totalReviews;

        const newRating = averageRating - totalReports * 0.1; // Deduct 0.1 for each report

        await this.prismaService.petsitter.update({
            where: { id: petsitterId },
            data: { rating: newRating },
        });
    }
}
