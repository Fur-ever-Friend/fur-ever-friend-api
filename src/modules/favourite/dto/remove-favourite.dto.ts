import { IsNotEmpty, IsUUID } from "class-validator";

export class RemoveFavouriteDto {
    @IsNotEmpty()
    @IsUUID('4')
    customerId: string;
}