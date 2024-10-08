import { InternalServerErrorException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

export async function hashPassword(password: string) {
    try {
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password, salt);
        return hashedPassword;
    } catch (err) {
        throw new InternalServerErrorException('Error while hashing password');
    }
}
