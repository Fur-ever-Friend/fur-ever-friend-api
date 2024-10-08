import { randomBytes } from 'crypto';

function isAscii(str: string): boolean {
    return /^[\x00-\x7F]*$/.test(str);
}

export function checkFileNameEncoding(fileName: string): boolean {
    return isAscii(fileName);
}

export function generateRandomFileName(): string {
    return randomBytes(16).toString('hex');
}
