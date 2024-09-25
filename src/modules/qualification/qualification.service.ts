import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { QualificationDto } from './dto/qualification.dto';
import { Prisma, Qualification } from '@prisma/client';
import { hashPassword } from 'src/utils';

@Injectable()
export class QualificationService {
    constructor(private readonly prismaService: PrismaService) { }

    async save({ password, ...rest }: QualificationDto, file: Express.Multer.File) {
        try {
            const hashedPassword = await hashPassword(password);
            const qualification = await this.prismaService.qualification.create({
                data: {
                    ...rest,
                    password: hashedPassword,
                    certificateUrl: file.filename,
                } as any,
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

}
