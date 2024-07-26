import { BadGatewayException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Response } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';
import * as crypto from 'crypto'
import { CreateCampaignDto, CreateKeyDto, CreateTemplateDto } from './dto/esp.dto';

@Injectable()
export class EspApiKeysService {
    constructor(private prisma: PrismaService) {}

    async fetchKeys(userId: string, res: Response) {
        const keys = await this.prisma.eSP.findMany({ where: { user_id: userId }, select: {
            label: true,
            created_at: true,
            id: true
        } });
        return res.send({message: 'Success', keys})
    }

    async createkey(dto: CreateKeyDto, userId: string,  res: Response) {
        const { key, label } = dto;
        const encryptedKey = this.encrypt(key)
        const newKey = await this.prisma.eSP.create({ data: {
            user_id: userId,
            api_key: encryptedKey,
            provider: 'Klayvio',
            label: label
        }});
        return res.send({ message: 'Success', newKey });
    }

    async createTemplate(apiKeyId : string, html : string, name : string, userId: string, ) {
        const apiKey = await this.prisma.eSP.findUnique({where: {id: apiKeyId}})
        if (apiKey.user_id !== userId) return new UnauthorizedException('You are unauthorized to access this api key')
        const decryptedKey = this.decrypt(apiKey.api_key)
        const url = 'https://a.klaviyo.com/api/templates/';
        const options = {
            method: 'POST',
            headers: {
              accept: 'application/json',
              revision: '2024-07-15',
              'content-type': 'application/json',
              Authorization: decryptedKey
            },
            body: JSON.stringify({
                data: {
                    type: 'Template',
                    name: name,
                    html: html,
                    text: 'hello world'
                }
            })
        }
        const response = await fetch(url, options);
        const data = await response.json()
        console.log(data)
        if (response.ok) {
            const template = await this.prisma.klaviyoTemplates.create({ data: {
                template_id: data.data.id,
                user_id: userId,
            } })
            return data.data
        } else {
            return { error: data }
        }
    }

    async createCampaign(dto: CreateCampaignDto, user_id: string, res: Response) {
        const { html, apiKeyId, templateName, 
            campaignName, emailSubject, preview_text, from_email, from_name, reply_to_email, datetime } = dto
        const apiKey = await this.prisma.eSP.findUnique({where: {id: apiKeyId}})
        if (apiKey.user_id !== user_id) return new UnauthorizedException('You are unauthorized to access this api key')
        const decryptedKey = this.decrypt(apiKey.api_key)

        const template = await this.createTemplate( apiKeyId, html, templateName , user_id)
        if (template.error) return new BadGatewayException(template.error);

        const campaignUrl = 'https://a.klaviyo.com/api/campaigns/';
        const campaignOptions = {
            method: 'POST',
            headers: {
            accept: 'application/json',
            revision: '2024-07-15',
            'content-type': 'application/json',
            Authorization: decryptedKey
            },
            body: JSON.stringify({
            data: {
                type: 'campaign',
                attributes: {
                name: campaignName,
                send_strategy: {method: 'static', options_static: {datetime: datetime}},
                tracking_options: {utm_params: [{name: 'utm_medium', value: 'campaign'}]},
                'campaign-messages': {
                    data: [
                    {
                        type: 'campaign-message',
                        attributes: {
                        channel: 'email',
                        label: 'My message name',
                        content: {
                            subject: emailSubject,
                            preview_text: preview_text,
                            from_email: from_email,
                            from_label: from_name,
                            reply_to_email: reply_to_email,
                            cc_email: 'cc@my-company.com',
                            bcc_email: 'bcc@my-company.com'
                        },
                        render_options: {
                            shorten_links: true,
                            add_org_prefix: true,
                            add_info_link: true,
                            add_opt_out_language: false
                        }
                        }
                    }
                    ]
                }
                }
            }
            })
        };

        const createCampaignResponse = await fetch(campaignUrl, campaignOptions);  
        const campaignData = await createCampaignResponse.json(); 
        if (createCampaignResponse.ok) {
            const campaign = await this.prisma.klaviyoCampaigns.create({ data: {
                user_id: user_id,
                campaign_id: campaignData.data.id
            }});
            const assignTemplateUrl = 'https://a.klaviyo.com/api/campaign-message-assign-template/';
            const assignTemplateOptions = {
                method: 'POST',
                headers: {
                    accept: 'application/json',
                    revision: '2024-07-15',
                    'content-type': 'application/json',
                    Authorization: decryptedKey
                },
                body: JSON.stringify({
                    data: {
                        type: 'campaign-message',
                        id: campaignData.data.id,
                        relationships: {template: {data: {type: 'template', id: template.id}}}
                    }
                })
            };
            const assignTemplateResponse = await fetch(assignTemplateUrl, assignTemplateOptions);
            const assignTemplateData = await assignTemplateResponse.json();
            if (assignTemplateResponse.ok) {
                return res.send({message: 'Success', campaignData: campaignData.data, assignTemplateData: assignTemplateData.data, })
            } else {
                return new BadGatewayException(assignTemplateData)
            }
        } else {
            return new BadGatewayException(campaignData)
        }      
    }

    encrypt(key: string) {
        const iv = Buffer.from(process.env.IV, 'hex');
        const encypt_key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex')
        const cipher = crypto.createCipheriv('aes256', encypt_key, iv);
        const encryptedKey = cipher.update(key, 'utf8', 'hex' ) + cipher.final('hex')

        return encryptedKey
    }

    decrypt(key : string) {
        const iv = Buffer.from(process.env.IV, 'hex');
        const encypt_key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex')
        const dicipher = crypto.createDecipheriv('aes256', encypt_key, iv)
        const decryptedKey = dicipher.update(key, 'hex', 'utf8') + dicipher.final('utf8')

        return decryptedKey
    }

    
}
