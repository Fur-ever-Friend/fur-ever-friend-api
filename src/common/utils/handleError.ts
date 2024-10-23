import { BadRequestException, HttpException, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { ZodError } from "zod"; // Import ZodError

export function handleError(err: unknown, methodName: string) {
    if (err instanceof PrismaClientKnownRequestError) {
        switch (err.code) {
            case 'P2002':
                // Unique constraint violation
                throw new BadRequestException('A record with this field already exists.');
            case 'P2003':
                // Foreign key constraint failure
                throw new BadRequestException('Foreign key constraint failed.');
            case 'P2005':
                // Invalid data format
                throw new BadRequestException('Invalid data format.');
            case 'P2025':
                // Record not found
                throw new NotFoundException('Record not found.');
            default:
                // Unknown Prisma error
                console.error(`[PrismaError] ${methodName}: ${err.message}`);
                throw new InternalServerErrorException('Database error occurred.');
        }
    } else if (err instanceof ZodError) {
        // Handle Zod validation errors
        console.error(`[ZodError] ${methodName}: ${err.errors}`);
        const messages = err.errors.map(e => e.message).join(', '); // Collect all error messages
        throw new BadRequestException(`Validation failed: ${messages}`);
    } else if (err instanceof HttpException) {
        console.error(`[${err.name}] ${methodName}: ${err.message}`);
        throw err;
    } else if (err instanceof SyntaxError) {
        console.error(`[${err.name}] ${methodName}: ${err.message}`);
        throw new BadRequestException('Invalid JSON format');
    } else if (err instanceof Error) {
        console.log(`[${err.name}] ${methodName}: ${err.message}`);
    } else {
        console.log(`[ERROR] ${methodName}: ${err}`);
    }
    throw new InternalServerErrorException();
}
