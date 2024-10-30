import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { QualificationDto } from './dto/qualification.dto';
import { Prisma, Qualification, State } from '@prisma/client';
import { hashPassword } from 'src/common/utils';

@Injectable()
export class QualificationService {
    constructor(private readonly prismaService: PrismaService) { }

    async create({ password, ...rest }: QualificationDto, file: Express.Multer.File) {
        try {
            const hashedPassword = await hashPassword(password);
            const qualification = await this.prismaService.qualification.create({
                data: {
                    ...rest,
                    password: hashedPassword,
                    certificateUrl: file.filename,
                } as Prisma.QualificationCreateInput,
                select: {
                    id: true,
                    email: true,
                    state: true,
                    certificateUrl: true,
                    createdAt: true,
                    phone: true,
                }
            });
            return qualification;
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                throw new BadRequestException('Email already exists');
            }

            throw error;
        }
    }

    async getQualification(email: string): Promise<Partial<Qualification>> {
        const qualification = await this.prismaService.qualification.findUnique({
            where: {
                email
            },
            select: {
                id: true,
                email: true,
                firstname: true,
                lastname: true,
                state: true,
                certificateUrl: true,
                createdAt: true,
                phone: true,
            }
        })

        if (!qualification) throw new NotFoundException(`Qualification with email: ${email} not found!`);

        return qualification;
    }

    async getQualificationById(id: string): Promise<Partial<Qualification>> {
        const qualification = await this.prismaService.qualification.findUnique({
            where: {
                id
            },
            select: {
                id: true,
                email: true,
                firstname: true,
                lastname: true,
                state: true,
                certificateUrl: true,
                createdAt: true,
                phone: true,
            }
        })

        if (!qualification) throw new NotFoundException(`Qualification with id: ${id} not found!`);

        return qualification;
    }

    async getQualifications(): Promise<Partial<Qualification>[]> {
        return this.prismaService.qualification.findMany({
            select: {
                id: true,
                email: true,
                firstname: true,
                lastname: true,
                state: true,
                certificateUrl: true,
                createdAt: true,
                phone: true,
            }
        });
    }

    async updateQualification(id: string, state: State): Promise<void> {
        const qualification = await this.prismaService.qualification.update({
            where: { id },
            data: { state }
        });
        if (!qualification) throw new NotFoundException(`Qualification with id: ${id} not found!`);
    }

    async deleteQualification(id: string): Promise<void> {
        const qualification = await this.prismaService.qualification.delete({
            where: { id }
        });

        if (!qualification) throw new NotFoundException(`Qualification with id: ${id} not found!`);
    }
}
