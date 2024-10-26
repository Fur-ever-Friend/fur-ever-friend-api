import { Injectable, BadRequestException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LoginSchema } from '../dto';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {

    canActivate(context: any) {
        const request = context.switchToHttp().getRequest();

        const authValidation = LoginSchema.parse({
            email: request.body.email,
            password: request.body.password
        })

        console.log("authValidation", authValidation);

        return super.canActivate(context);
    }
}
