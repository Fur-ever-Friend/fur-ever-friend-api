import { IsNotEmpty, IsUUID } from "class-validator";

export class CreateFavouriteDto {
    @IsNotEmpty()
    @IsUUID("4")
    customerId: string;

    @IsNotEmpty()
    @IsUUID("4")
    petsitterId: string;
}
