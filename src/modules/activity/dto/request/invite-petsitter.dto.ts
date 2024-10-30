import { IsNotEmpty, IsUUID } from "class-validator";

export class InvitePetsitterDto {
    @IsUUID("4")
    petsitterId: string;
}