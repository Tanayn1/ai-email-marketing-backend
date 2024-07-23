import { IsNotEmpty } from "class-validator";

export class ScrapeProduct {
    @IsNotEmpty()
    url : string

    @IsNotEmpty()
    brandId : string
}

export class UpdateProductDto {
    @IsNotEmpty()
    product_id: string

    @IsNotEmpty()
    price: string

    @IsNotEmpty() 
    product_name: string

    @IsNotEmpty()
    images: Array<string>

    @IsNotEmpty()
    description: string 
}

export class addImageDto {
    @IsNotEmpty()
    url: string

    @IsNotEmpty()
    product_id: string
}