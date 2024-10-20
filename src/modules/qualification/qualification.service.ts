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
            });
            return qualification;
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                throw new BadRequestException('Email already exists');
            }

            throw error;
        }
    }

    async getQualification(email: string): Promise<Qualification> {
        const qualification = await this.prismaService.qualification.findUnique({
            where: {
                email
            }
        })

        if (!qualification) throw new NotFoundException(`Qualification with email: ${email} not found!`);

        return qualification;
    }

    async getQualifications(): Promise<Qualification[]> {
        return this.prismaService.qualification.findMany();
    }

    async updateQualification(id: string, state: State): Promise<Qualification> {
        const qualification = await this.prismaService.qualification.update({
            where: { id },
            data: { state }
        });

        return qualification;
    }

    async deleteQualification(id: string): Promise<Qualification> {
        const qualification = await this.prismaService.qualification.delete({
            where: { id }
        });

        return qualification;
    }
}
