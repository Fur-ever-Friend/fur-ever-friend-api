import { Injectable, PipeTransform, BadRequestException } from '@nestjs/common';
import { validate, ValidationError } from 'class-validator';

@Injectable()
export class CustomValidationPipe implements PipeTransform {
    async transform(value: any) {
        const errors: ValidationError[] = await validate(value);

        if (errors.length > 0) {
            // Extract the first validation error and format the message
            const messages = errors.map(error =>
                `Field ${error.property} is invalid: ${Object.values(error.constraints).join(', ')}`
            );
            throw new BadRequestException(messages.join(', '));
        }

        console.log('CustomValidationPipe', value);
        return value;
    }
}
