import { Brands } from "@prisma/client";
import { IsNotEmpty } from "class-validator";
import { Colors, Fonts } from "types/types";


export class ScrapeBrands {
    @IsNotEmpty()
    url: string

    @IsNotEmpty()
    brandName: string
}

export class AddLogoDto {
    @IsNotEmpty()
    brandId: string

    @IsNotEmpty()
    logo: string
}

export class UpdateBrandsDto {
    @IsNotEmpty()
    brandName: string

    @IsNotEmpty()
    logos: string[]

    @IsNotEmpty()
    fonts: Fonts

    @IsNotEmpty()
    colors: Colors

    @IsNotEmpty()
    brandId: string
}