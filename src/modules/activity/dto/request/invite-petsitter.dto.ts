import { IsNotEmpty, IsString, IsUUID } from "class-validator";

export class InvitePetsitterDto {
    @IsNotEmpty()
    @IsUUID("4")
    petsitterId: string;
}