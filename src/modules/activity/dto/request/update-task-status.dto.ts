import { IsBoolean } from "class-validator";

export class UpdateTaskStatusDto {
    @IsBoolean()
    status: boolean;
}