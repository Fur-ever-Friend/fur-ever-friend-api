import { IsNotEmpty, IsUUID } from "class-validator";

export class CreateInvitationDto {
    @IsNotEmpty()
    @IsUUID("4")
    activityId: string;

    @IsNotEmpty()
    @IsUUID("4")
    petsitterId: string;
}
