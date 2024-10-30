import { IsNotEmpty, IsNumber, IsUUID } from "class-validator";
export class CreatePaymentDto {
    @IsNotEmpty()
    @IsNumber()
    amount: number;

    @IsUUID('4')
    @IsNotEmpty()
    activityId: string;
}
