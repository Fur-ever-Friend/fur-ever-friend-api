import * as bcrypt from 'bcryptjs'

export async function validatePassword(pasword: string, hashedPassword: string) {
    const isValidUser = await bcrypt.compare(pasword, hashedPassword);
    return isValidUser;
}
