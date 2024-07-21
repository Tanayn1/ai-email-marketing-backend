import { IsNotEmpty } from "class-validator";


export class GenerateEmailDto {
    @IsNotEmpty()
    prompt: string

    @IsNotEmpty()
    brand_id: string

    @IsNotEmpty()
    product_id: string

    @IsNotEmpty()
    designStyle: string
}