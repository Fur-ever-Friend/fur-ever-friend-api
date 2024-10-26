import { User } from "@prisma/client";
import { TokenResponseDto } from "./token-response.dto";

export class AuthResponseDto {
    token: TokenResponseDto
    user: Partial<User>
}