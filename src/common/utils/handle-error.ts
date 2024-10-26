import { BadRequestException, HttpException, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { ZodError } from "zod";

export function handleError(err: unknown, methodName: string, message?: string): void {
    if (err instanceof PrismaClientKnownRequestError) {
        switch (err.code) {
            case 'P2002':
                // Unique constraint violation
                console.log(`[PrismaError] ${methodName}: ${err.message}`);
                throw new BadRequestException(`${message} already exists.`);
            case 'P2003':
                // Foreign key constraint failure
                console.log(`[PrismaError] ${methodName}: ${err.message}`);
                throw new BadRequestException('Foreign key constraint failed.');
            case 'P2005':
                // Invalid data format
                console.log(`[PrismaError] ${methodName}: ${err.message}`);
                throw new BadRequestException('Invalid data format.');
            case 'P2025':
                // Record not found
                console.log(`[PrismaError] ${methodName}: ${err.message}`);
                throw new NotFoundException(`${message} not found.`);
            default:
                // Unknown Prisma error
                console.error(`[PrismaError] ${methodName}: ${err.message}`);
                throw new InternalServerErrorException('Database error occurred.');
        }
    } else if (err instanceof ZodError) {
        console.error(`[ZodError] ${methodName}:`, err.errors);
        const messages = err.errors.map(e => e.message)
        throw new BadRequestException(messages);
    } else if (err instanceof HttpException) {
        console.error(`[${err.name}] ${methodName}: ${err.message}`);
        throw err;
    } else if (err instanceof SyntaxError) {
        console.error(`[${err.name}] ${methodName}: ${err.message}`);
        throw new BadRequestException('Invalid JSON format');
    } else if (err instanceof Error) {
        console.log(`[${err.name}] ${methodName}: ${err.message}`);
        throw new BadRequestException(err.message);
    } else {
        console.log(`[ERROR] ${methodName}: ${err}`);
        throw new InternalServerErrorException();
    }
}
