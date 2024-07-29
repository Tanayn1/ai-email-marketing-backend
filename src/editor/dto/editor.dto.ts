import { IsNotEmpty } from "class-validator";


export class ManualEditSessionDto {
    @IsNotEmpty()
    brand_id: string
    
    @IsNotEmpty()
    product_id:string

    @IsNotEmpty()
    product_name: string
}

export class SaveSessionDto {
    @IsNotEmpty()
    session_id: string

    @IsNotEmpty()
    json_array: Array<any>

    @IsNotEmpty()
    html: string
}

export class SessionFromTemplateDto {
    @IsNotEmpty()
    templateId: string

    @IsNotEmpty()
    product_id: string

    @IsNotEmpty()
    brand_id: string
}

export class GetImageDto {
    @IsNotEmpty()
    html: string
}