import { IsIn, IsNotEmpty, IsNumber, IsString, IsUUID } from "class-validator";

export class CreateReviewDto {
    @IsUUID("4")
    customerId: string;

    @IsUUID("4")
    petsitterId: string;

    @IsNumber()
    @IsIn([1, 2, 3, 4, 5])
    rating: number;

    @IsString()
    @IsNotEmpty()
    content: string;
}
