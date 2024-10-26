import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from "@nestjs/common";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { ZodError } from "zod";
import { Response } from "express";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = ['Something went wrong'];
        let error = 'Internal server error';

        if (exception instanceof HttpException) {
            const res = exception.getResponse() as { message: string; statusCode: number; error: string; };
            statusCode = res.statusCode;
            error = res.error;
            message = [res.message];
        } else if (exception instanceof PrismaClientKnownRequestError) {
            console.error(`[PrismaError]: ${exception.message}`);
            switch (exception.code) {
                case 'P2002':
                    message = ['A record with this field already exists.'];
                    statusCode = HttpStatus.BAD_REQUEST;
                    error = 'Bad Request';
                    break;
                case 'P2003':
                    message = ['Foreign key constraint failed.'];
                    statusCode = HttpStatus.BAD_REQUEST;
                    error = 'Bad Request';
                    break;
                case 'P2005':
                    message = ['Invalid data format.'];
                    statusCode = HttpStatus.BAD_REQUEST;
                    error = 'Bad Request';
                    break;
                case 'P2025':
                    message = ['Record not found.'];
                    statusCode = HttpStatus.NOT_FOUND;
                    error = 'Not Found';
                    break;
                default:
                    break;
            }
        } else if (exception instanceof ZodError) {
            message = exception.errors.map(e => e.message);
            statusCode = HttpStatus.BAD_REQUEST;
            error = 'Bad Request';
        } else if (exception instanceof SyntaxError) {
            message = [exception.message];
            statusCode = HttpStatus.BAD_REQUEST;
            error = 'Bad Request';
        } else if (exception instanceof Error) {
            message = [exception.message];
            statusCode = HttpStatus.BAD_REQUEST;
            error = 'Bad Request';
        } else {
            console.log('unknown exception', exception);
        }

        response.status(statusCode).json({
            statusCode,
            error,
            message,
        });
    }

}
