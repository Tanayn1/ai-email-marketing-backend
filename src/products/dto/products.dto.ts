import { IsNotEmpty } from "class-validator";

export class ScrapeProduct {
    @IsNotEmpty()
    url : string

    @IsNotEmpty()
    brandId : string
}