import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Role, User } from '@prisma/client'
import { ROLES_KEY } from '../decorators/roles.decorator'
import { Request } from 'express'
@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        console.log('[RolesGuard] requiredRoles:', requiredRoles)
        if (!requiredRoles) {
            return true;
        }
        const req = context.switchToHttp().getRequest<Request>()
        const user = req.user as User
        console.log('[RolesGuard] user:', user)
        if (!user) return false

        return requiredRoles.some((role) => user.role.includes(role))
    }
}
