import { IsUUID, Length } from "class-validator";

export class BreedDto {
    @Length(2, 50)
    name: string;

    @IsUUID()
    animalTypeId: string;
}