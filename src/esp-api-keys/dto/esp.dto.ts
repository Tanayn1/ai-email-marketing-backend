import { IsNotEmpty } from "class-validator";

export class CreateKeyDto {
    @IsNotEmpty()
    key: string

    @IsNotEmpty()
    label: string
}

export class CreateTemplateDto {
    @IsNotEmpty()
    apiKeyId: string

    @IsNotEmpty()
    html: string

    @IsNotEmpty()
    name: string
}

export class CreateCampaignDto {
    @IsNotEmpty()
    apiKeyId: string

    @IsNotEmpty()
    html: string

    @IsNotEmpty()
    templateName: string

    @IsNotEmpty()
    campaignName: string

    @IsNotEmpty()
    emailSubject: string

    @IsNotEmpty()
    preview_text: string

    @IsNotEmpty()
    from_email: string

    @IsNotEmpty()
    from_name: string

    @IsNotEmpty()
    reply_to_email: string

    @IsNotEmpty()
    datetime: string
}