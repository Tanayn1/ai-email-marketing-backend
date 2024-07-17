import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { GenerateEmailDto } from './dto/ai.dto';
import { Response } from 'express';

@Injectable()
export class AiService {
    private readonly openAi: OpenAI
    
    constructor() {
        this.openAi = new OpenAI({
            apiKey: ''
        })
    }

    async generateEmailFromPrompt(dto : GenerateEmailDto, res: Response) {
        const { prompt } = dto;
        const templateSelection = await this.openAi.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [{
                role: 'user',
                content: `Based on this prompt ${prompt}, which email template should i use? Please response with the template name only.\n Templates: `
            }]
        });

        const templateName = templateSelection.choices[0].message.content.trim()
    }

}
