import { AccountState } from "@prisma/client";
import { IsEnum } from "class-validator";

export class SetUserStatusDto {
    @IsEnum(AccountState)
    state: AccountState;
}