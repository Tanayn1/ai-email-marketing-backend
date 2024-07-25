import { IsNotEmpty } from "class-validator";

export class CreateKeyDto {
    @IsNotEmpty()
    key: string

    @IsNotEmpty()
    label: string
}