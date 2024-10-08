import { Role } from '@prisma/client';
import { IsUUID, IsEnum, IsOptional } from 'class-validator';

export class JwtPayload {

    @IsUUID()
    sub: string;

    @IsEnum(Role)
    role: Role;

    @IsOptional()
    iat?: number;

    @IsOptional()
    exp?: number;

    @IsOptional()
    nbf?: number;

    @IsOptional()
    jti?: string;
}
