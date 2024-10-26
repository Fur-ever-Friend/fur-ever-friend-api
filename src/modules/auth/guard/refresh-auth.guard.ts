import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class RefreshJwtAuthGuard extends AuthGuard('jwt-refresh') {
    private readonly logger = new Logger(RefreshJwtAuthGuard.name);

    handleRequest(err: any, user: any, info: any) {
        if (err) {
            this.logger.error('Authentication failed', err);
        }

        if (!user) {
            throw err || new UnauthorizedException('User not authorized');
        }

        return user;
    }
}
