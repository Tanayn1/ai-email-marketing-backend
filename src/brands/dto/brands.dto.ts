import { IsNotEmpty } from "class-validator";


export class ScrapeBrands {
    @IsNotEmpty()
    url: string
}