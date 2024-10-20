import { Length } from "class-validator";

export class AnimalTypeDto {
    @Length(2, 50)
    name: string;
}
