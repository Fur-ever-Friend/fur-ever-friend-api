import { InternalServerErrorException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

export async function hashPassword(password: string) {
    try {
        const salt = await bcrypt.genSalt();
        return await bcrypt.hash(password, salt);
    } catch (err) {
        throw new InternalServerErrorException('Error while hashing password');
    }
}
