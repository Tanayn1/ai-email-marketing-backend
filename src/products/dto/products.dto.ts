import { IsNotEmpty } from "class-validator";

export class ScrapeProduct {
    @IsNotEmpty()
    url
}