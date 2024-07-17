import { IsNotEmpty } from "class-validator";


export class GenerateEmailDto {
    @IsNotEmpty()
    prompt: string
}