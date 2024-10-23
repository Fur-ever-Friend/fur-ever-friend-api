import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from "@nestjs/common";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { ZodError } from "zod";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const status =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;

        let message: string;

        if (exception instanceof PrismaClientKnownRequestError) {
            message = this.handlePrismaError(exception);
        } else if (exception instanceof ZodError) {
            message = this.handleZodError(exception);
        } else if (exception instanceof HttpException) {
            message = exception.message;
        } else if (exception instanceof SyntaxError) {
            message = 'Invalid JSON format';
        } else if (exception instanceof Error) {
            message = exception.message;
        } else {
            message = 'An unexpected error occurred.';
        }

        response.status(status).json({
            statusCode: status,
            message,
        });
    }

    private handlePrismaError(err: PrismaClientKnownRequestError): string {
        switch (err.code) {
            case 'P2002':
                return 'A record with this field already exists.';
            case 'P2003':
                return 'Foreign key constraint failed.';
            case 'P2005':
                return 'Invalid data format.';
            case 'P2025':
                return 'Record not found.';
            default:
                console.error(`[PrismaError]: ${err.message}`);
                return 'Database error occurred.';
        }
    }

    private handleZodError(err: ZodError): string {
        console.error(`[ZodError]:`, err.errors);
        return `Validation failed: ${err.errors.map(e => e.message).join(', ')}`;
    }
}
