import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AccountState } from '@prisma/client';

@Injectable()
export class AdminService {
    constructor(private readonly prismaService: PrismaService) { }

    // async getAdmins() {
    //     return this.prismaService.admin.findMany({
    //         include: {
    //             user: true
    //         }
    //     });
    // }

    // async getAdminById(id: string) {
    //     return this.prismaService.admin.findUnique({
    //         where: {
    //             id
    //         },
    //         include: {
    //             user: true
    //         }
    //     });
    // }

    async setAccountState(userId: string, state: AccountState) {
        const user = await this.prismaService.user.findUnique({
            where: {
                id: userId
            }
        });

        if (!user) throw new NotFoundException('User not found');

        if (user.role === "ADMIN") throw new BadRequestException('Cannot change account state of an admin');

        return this.prismaService.user.update({
            where: {
                id: userId
            },
            data: {
                accountStatus: state
            },
            include: {
                customer: user.role === "CUSTOMER" ? true : false,
                petsitter: user.role === "PETSITTER" ? true : false
            }
        });

    }

}
