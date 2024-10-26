import { IsNotEmpty, IsString, IsUUID } from "class-validator";

export class CreateNotificationDto {
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsString()
    content: string;

    @IsUUID("4")
    userId: string;
}
