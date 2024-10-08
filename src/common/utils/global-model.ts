import { IsUUID } from "class-validator";

export class Id {
    @IsUUID()
    id: string
}
