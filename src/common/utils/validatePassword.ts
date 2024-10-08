import * as bcrypt from 'bcryptjs'

export async function validatePassword(pasword: string, hashedPassword: string) {
    const isValidUser = await bcrypt.compare(pasword, hashedPassword);
    return isValidUser;
}

export async function verify(plain: string, hashed: string) {
    return bcrypt.compare(plain, hashed);
}
