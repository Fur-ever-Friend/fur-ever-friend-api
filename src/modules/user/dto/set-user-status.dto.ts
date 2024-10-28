import { AccountState } from "@prisma/client";
import { IsEnum } from "class-validator";

export class SetUserStatusDto {
    @IsEnum(AccountState, { message: 'State must be a valid account state' })
    state: AccountState;
}
