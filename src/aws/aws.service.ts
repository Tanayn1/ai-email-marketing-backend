import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import * as fs from 'fs';

@Injectable()
export class AwsService {
    private readonly s3Client = new S3Client({
        region: process.env.AWS_S3_REGION, 
        credentials: {
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            accessKeyId: process.env.AWS_ACCESS_KEY_ID
        }
    })

    async uploadFile(file: Express.Multer.File, res: Response) {
        console.log(file)
        await this.s3Client.send(
            new PutObjectCommand({
                Bucket: 'mailspark',
                Key: file.originalname,
                Body: file.buffer,
                ContentType: file.mimetype
            })
        )
          return res.send({message: "Success", src: `https://mailspark.s3.amazonaws.com/${file.originalname}`}).status(200)
    }

    async uploadFileExport(filePath: string, fileName: string, contentType : 'image/png' | 'image/svg+xml') {
        try {
            
            const fileContent = fs.readFileSync(filePath);
            await this.s3Client.send(
                new PutObjectCommand({
                    Bucket: 'mailspark',
                    Key: fileName,
                    Body: fileContent,
                    ContentType: contentType 
                })
            )
            
              return `https://mailspark.s3.amazonaws.com/${fileName}`
        } catch (error) {
            console.log(error)
        }

    }

    async uploadFileSVGorImg(fileContent: string | Buffer, fileName: string, contentType : 'image/png' | 'image/svg+xml') {
        try {
            
            await this.s3Client.send(
                new PutObjectCommand({
                    Bucket: 'mailspark',
                    Key: fileName,
                    Body: fileContent,
                    ContentType: contentType 
                })
            )
            
              return `https://mailspark.s3.amazonaws.com/${fileName}`
        } catch (error) {
            console.log(error)
        }

    }

    async uploadFileWithoutRes(file: Express.Multer.File) {
        console.log(file)
        await this.s3Client.send(
            new PutObjectCommand({
                Bucket: 'mailspark',
                Key: file.originalname,
                Body: file.buffer,
                ContentType: file.mimetype
            })
        )
          return `https://mailspark.s3.amazonaws.com/${file.originalname}`
    }
}
