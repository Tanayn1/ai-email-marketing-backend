import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { GenerateEmailDto } from './dto/ai.dto';
import { Response } from 'express';
import * as template from  '../email-templates/testEmail.json' 
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AiService {
    private readonly openAi: OpenAI
    

    constructor(private prisma: PrismaService) {
        this.openAi = new OpenAI({
            apiKey: process.env.OPEN_AI_KEY
        })
    }

    async getTemplateName(dto : GenerateEmailDto, res: Response) {
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

    async generateEmail() {
        const prompt = 'I want a an email for my shoes im selling nike air max 90s'
        function extractPlaceholders(obj: any, placeholders: Set<string> = new Set()): Set<string> {
            const placeholderPattern = /{{(.*?)}}/g;
          
            function recursiveExtract(value: any) {
              if (typeof value === 'string') {
                let match;
                while ((match = placeholderPattern.exec(value)) !== null) {
                  placeholders.add(match[1]);
                }
              } else if (typeof value === 'object' && value !== null) {
                for (const key in value) {
                  if (value.hasOwnProperty(key)) {
                    recursiveExtract(value[key]);
                  }
                }
              }
            }
          
            recursiveExtract(obj);
            return placeholders;
          }
          
          const placeholders = extractPlaceholders(template);
          const arrayOfPlaceholders = Array.from(placeholders);

         const jsonSchema = {
            //"placeholders": [{
                "{{placeholderName}}":"{{content}}"
            //}]
         } 
         const copy = await this.openAi.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [{
                role: 'system', 
                content: `you are a email marketing specialist that provides an output in valid json. The data schema should be like this ${jsonSchema} `
            }, {
                role: 'user',
                content: `You are tasked with generating content for an email marketing template. The template contains various placeholders for different elements such as the CTA button, title, and more. The output should be in a JSON format where each key is the placeholder name and each value is the generated content for that placeholder. Here are the placeholders: ${arrayOfPlaceholders} and here is the user prompt: ${prompt}`
            }],
            response_format: { type: 'json_object' }
         })

          const jsonObj = copy.choices[0].message.content
          const copyObj = JSON.parse(jsonObj);
          console.log(arrayOfPlaceholders, copyObj);

          function fillPlaceholders(template : any, content : any) {
            // Function to recursively fill placeholders in an object
            function replacePlaceholders(obj, content) {
                if (typeof obj === 'string') {
                    // Check if the string is a placeholder
                    return obj.replace(/\{\{(.*?)\}\}/g, (match, p1) => {
                        return content[p1] || match; // Replace with content or leave as is if not found
                    });
                } else if (Array.isArray(obj)) {
                    // If the object is an array, apply replacement to each element
                    return obj.map(item => replacePlaceholders(item, content));
                } else if (typeof obj === 'object' && obj !== null) {
                    // If the object is an object, apply replacement to each key
                    let result = {};
                    for (let key in obj) {
                        if (obj.hasOwnProperty(key)) {
                            result[key] = replacePlaceholders(obj[key], content);
                        }
                    }
                    return result;
                } else {
                    // For any other type, return as is
                    return obj;
                }
            }
        
            // Parse the JSON template and replace placeholders
            let filledTemplate = replacePlaceholders(template, content);
        
            // Convert the filled template back to JSON string
            return JSON.stringify(filledTemplate, null, 2);
        }

        const filledTemplate = fillPlaceholders(template, copyObj )
        console.log(filledTemplate)

    }

    async preFillTemplate() {
        const colorAndFontRegex = /\{\{\{(.*?)\}\}\}/g
        const brand = await this.prisma.brands.findUnique({ where: { id: 'a28a3ad9-cb2c-4029-b084-39cc2864e698' } })
        console.log(brand)
        const preFill = {
            text_color: 'black',
            button_color: 'blue',
            button_text_color: 'white',
            background_color: 'white',
            font_header: 'Arial',
            font_text: 'Arial'
        };
        const preFillTemplate = this.fillPlaceholders(template, preFill, colorAndFontRegex);
        console.log(preFillTemplate)


    }

    async fillPlaceholders(template : any, content : any, regex: RegExp) {
        // Function to recursively fill placeholders in an object
        function replacePlaceholders(obj : any, content: any) {
            if (typeof obj === 'string') {
                // Check if the string is a placeholder
                return obj.replace(regex, (match, p1) => {
                    return content[p1] || match; // Replace with content or leave as is if not found
                });
            } else if (Array.isArray(obj)) {
                // If the object is an array, apply replacement to each element
                return obj.map(item => replacePlaceholders(item, content));
            } else if (typeof obj === 'object' && obj !== null) {
                // If the object is an object, apply replacement to each key
                let result = {};
                for (let key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        result[key] = replacePlaceholders(obj[key], content);
                    }
                }
                return result;
            } else {
                // For any other type, return as is
                return obj;
            }
        }
        // Parse the JSON template and replace placeholders
        let filledTemplate = replacePlaceholders(template, content);

        // Convert the filled template back to JSON string
        return JSON.stringify(filledTemplate, null, 2);
    }
    

}
