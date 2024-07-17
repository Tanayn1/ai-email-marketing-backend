import { BadRequestException, Injectable } from '@nestjs/common';
import { Response } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';
import { ManualEditSessionDto, SaveSessionDto, SessionFromTemplateDto } from './dto/editor.dto';

@Injectable()
export class EditorService {
    constructor(private prisma: PrismaService) {}

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
        const { session_id, json_array } = dto;

        const updatedEditSession = await this.prisma.editor.update({ where: { id: session_id }, data: {
            email_saves: json_array
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
}
