import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { GenerateEmailDto } from './dto/ai.dto';
import { Response } from 'express';
import * as template from  '../email-templates/testEmail.json' 
import { PrismaService } from 'src/prisma/prisma.service';
import { Brands, Products } from '@prisma/client';
import { encodeBase64, compress } from "lzutf8";
import { Colors, Fonts } from 'types/types';

@Injectable()
export class AiService {
    private readonly openAi: OpenAI
    

    constructor(private prisma: PrismaService) {
        this.openAi = new OpenAI({
            apiKey: process.env.OPEN_AI_KEY
        })
    }

    async getTemplateName(prompt: string, designStyle: string) {
        const jsonFormat = {
            "template_name": "{{name of template}}"
        }
        const templateSelection = await this.openAi.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `You are a email design specialist, you respond in valid json format with this exact format: ${jsonFormat}`
            },{
                role: 'user',
                content: `Based on this prompt ${prompt}, which email template should i use? Please response with the template name only.\n Templates: `
            }],
            response_format: { type: "json_object" }
        });

        const templateName  = JSON.parse(templateSelection.choices[0].message.content)


        return templateName.template_name
    }

    async writeCopy(userPrompt: string, brand: Brands, product: Products, template: any) {
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

         const prompt = `prompt: ${userPrompt} \n brand name: ${brand.brand_name} product name: ${product.product_name} product descriptions: ${product.description} product price: ${product.price}`
         const copy = await this.openAi.chat.completions.create({
            model: 'gpt-4o-mini',
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
        return filledTemplate

    }

    async preFillTemplate(brand: Brands, template : any) {
        const colorAndFontRegex = /\{\{\{(.*?)\}\}\}/g
        const fonts = brand.fonts as unknown as Fonts
        const colors = brand.colors as unknown as Colors
        const preFill = {
            text_color: colors.textColor,
            button_color: colors.buttonColor,
            button_text_color: colors.textColor ,
            background_color: colors.backgroundColor,
            font_header: fonts.primaryFont,
            font_text: fonts.secondaryFont
        };
        const preFillTemplate = this.fillPlaceholders(template, preFill, colorAndFontRegex);
        return preFillTemplate


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

    async compressTemplate(template : any, user_id : string, product: Products) {
        const encodedTemplate = encodeBase64(compress(template));
        const date = new Date()
        const newSession = await this.prisma.editor.create({ data: {
            session_name: product.product_name,
            user_id: user_id,
            brand_id: product.brand_id,
            product_id: product.id,
            email_saves: [{save: encodedTemplate, updated_at: `${date.toLocaleTimeString()}, ${date.toLocaleDateString()}`}]
        } })

        return newSession

    }

    async generateEmail(dto: GenerateEmailDto, user_id: string, res: Response) {
        const { prompt, brand_id, product_id, designStyle } = dto;
        const brand = await this.prisma.brands.findUnique({ where: { id: brand_id } })
        const product = await this.prisma.products.findUnique({ where: { id: product_id } });
        //const templateName = await this.getTemplateName(prompt, designStyle);
        const preFillTemplate = await this.preFillTemplate(brand, template);
        console.log(preFillTemplate)
        const templateJson = await this.writeCopy(prompt, brand, product, preFillTemplate);
        console.log(templateJson)
        const newSession = await this.compressTemplate(templateJson, user_id, product);
        console.log(newSession)
        return res.send({message: 'Success', newSession}).status(200);
    }
    

}
