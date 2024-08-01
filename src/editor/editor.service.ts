import { BadGatewayException, BadRequestException, Injectable } from '@nestjs/common';
import { Response } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';
import { addImageToAssetsDto, GetImageDto, ManualEditSessionDto, SaveSessionDto, SessionFromTemplateDto } from './dto/editor.dto';
import puppeteer from 'puppeteer';
import { AwsService } from 'src/aws/aws.service';

@Injectable()
export class EditorService {
    constructor(private prisma: PrismaService, private aws: AwsService) {}

    async manualEditingSession(userId: string, dto : ManualEditSessionDto, res : Response) {
        const { product_id, product_name, brand_id } = dto;
        
        const editSession = await this.prisma.editor.create({data: {
            user_id: userId,
            product_id: product_id,
            brand_id: brand_id,
            session_name: product_name
        }})

        if (editSession) {
            return res.send({ message: 'Success', editSession }).status(200)
        } else {
            return new BadRequestException('Failed to create editing seesion')
        }

    }

    async fetchEditingSession(sessionId: string, res: Response) {
        const session = await this.prisma.editor.findUnique({ where: { id: sessionId } });

        if (session) {
            return res.send({ message: 'Success', session }).status(200)
        } else {
            return new BadRequestException('No Editing Session Found')
        }
    }

    async fetchAllEditingSessions(userId: string, res: Response) {
        const sessions = await this.prisma.editor.findMany({ where: { user_id: userId } });
        return res.send({message: 'Success', sessions}).status(200)
    }

    async saveSession(dto : SaveSessionDto, res: Response) {
        const { session_id, json_array, html } = dto;
        const session = await this.prisma.editor.findUnique({ where: { id: session_id } });
        const previewUrl = await this.htmlToImageSave(html, session.id);
        const updatedEditSession = await this.prisma.editor.update({ where: { id: session_id }, data: {
            email_saves: json_array,
            preview_image_src: previewUrl
        } });
        
        return res.send({message: 'Success', updatedEditSession})
    }

    async newSessionFromTemplate(dto : SessionFromTemplateDto, user_id : string, res: Response) {
        const { templateId, product_id, brand_id } = dto;
        const template = await this.prisma.templates.findUnique({ where: { id: templateId } });
        const product = await this.prisma.products.findUnique({ where: { id: product_id } });
        if (!product) return new BadRequestException('No such product exists')
        if (!template) return new BadRequestException('No template found');
        const date = new Date()
        const editSession = await this.prisma.editor.create({ data: {
            user_id: user_id,
            product_id: product_id,
            brand_id: brand_id,
            session_name: product.product_name,
            email_saves: [{
                save: template.template,
                updated_at: `${date.toLocaleTimeString()}, ${date.toLocaleDateString()}`
            }]
        } });

        if (!editSession) return new BadRequestException('Failed to create session');
        return res.send({ message: 'Success', editSession }).status(200);
    }

    async htmlToImage(dto: GetImageDto, res: Response) {
        const { html } = dto
        const browser = await puppeteer.launch();
        console.log('Browser Launched')
        const page = await browser.newPage();
        console.log('New Page')
        try {
            // Set the content of the page
            await page.setContent(html, { waitUntil: 'networkidle0' });
            
            // Set viewport size to match the content
            const dimensions = await page.evaluate(() => {
                return {
                width: document.documentElement.offsetWidth,
                height: document.documentElement.offsetHeight,
                };
            });
            await page.setViewport(dimensions);
            
            // Capture the screenshot
            const screenshot = await page.screenshot({ path: 'output.png', fullPage: true });
            console.log('Screenshot captured')

            res.set('Content-Type', 'image/png');
            res.send(screenshot);        
        } catch (error) {
            console.log(error)
            return new BadGatewayException(error)
        } finally {
            await browser.close()
        }

          
    }

    async htmlToImageSave(html: string, fileName: string) {
        const browser = await puppeteer.launch();
        console.log('Browser Launched')
        const page = await browser.newPage();
        console.log('New Page')
        try {
            // Set the content of the page
            await page.setContent(html, { waitUntil: 'networkidle0' });
            
            // Set viewport size to match the content
            const dimensions = await page.evaluate(() => {
                return {
                width: document.documentElement.offsetWidth,
                height: document.documentElement.offsetHeight,
                };
            });
            await page.setViewport(dimensions);
            
            const filePath = `${fileName}.png`
            // Capture the screenshot
            const screenshot = await page.screenshot({ path: filePath, fullPage: true });
            const url = await this.aws.uploadFileExport(filePath, fileName, 'image/png');
            console.log(url)
            return url
        } catch {

        } finally {
            await browser.close()
        }

    }

    async getAssets(sessionId: string, res: Response) {
        const { assets } = await this.prisma.editor.findUnique({ where: { id: sessionId } });
        return res.send({message: "Success", assets}).status(200)
    }

    async addAssets(dto : addImageToAssetsDto, res: Response) {
        const { image, sessionId } = dto;
        const session = await this.prisma.editor.findUnique({ where: { id: sessionId } });
        const updatedSession = await this.prisma.editor.update({ where: { id: sessionId }, data: {
            assets: [...session.assets, image]
        } });
        return res.send({message: "Success", updatedSession});
    }
}
