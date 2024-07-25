import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';
import * as crypto from 'crypto'
import { CreateKeyDto } from './dto/esp.dto';

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
