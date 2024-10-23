import { Injectable, BadRequestException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LoginSchema } from '../dto';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {

    canActivate(context: any) {
        const request = context.switchToHttp().getRequest();

        const authValidation = LoginSchema.safeParse({
            email: request.body.email,
            password: request.body.password
        })

        if (!authValidation.success) {
            throw new BadRequestException(authValidation.error.errors);
        }

        return super.canActivate(context);
    }
}
